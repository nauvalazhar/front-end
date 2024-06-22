'use server';

import { exec } from 'child_process';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

export async function runCommands(formData: FormData) {
  const commands = formData.get('commands') as string;

  // run as a single command
  exec(commands, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

export async function action(prevData: any, formData: FormData) {
  const input = formData.get('input') as string;
  let warnings = {};
  let files = [];

  // remove empty lines
  let inputProcessed = input.replace(/^\s*[\r\n]/gm, '');

  const dom = new JSDOM(inputProcessed);
  const document = dom.window.document;

  // replace all <span style='mso-spacerun:yes'></span> with a indention
  document
    .querySelectorAll('span[style="mso-spacerun:yes"]')
    .forEach((span) => {
      span.textContent = '  ';
    });

  document.querySelectorAll('p.Codeblock').forEach((codeblock) => {
    // replace <p> with <pre>
    const pre = document.createElement('pre');
    pre.innerHTML = `<code>${codeblock.innerHTML}</code>`;

    codeblock.replaceWith(pre);
  });

  document.querySelectorAll('span').forEach((span) => {
    // check if span has font-family: Consolas
    // if so, replace with <code>
    if (span.style.fontFamily === 'Consolas') {
      const code = document.createElement('code');
      code.textContent = span.textContent;

      span.replaceWith(code);
    }
  });

  document.querySelectorAll('p[class*="MsoList"]').forEach((li) => {
    // replace '·' with '-'
    li.textContent = li.textContent.replace(/·/g, '-').trim();
    // replace &nbsp; with ' '
    li.textContent = li.textContent.replace(/ /g, ' ');
  });

  document.querySelectorAll('img[src]').forEach((img) => {
    // get alt text from the closest next <p> with .MsoCaption
    const el = img.closest('p').nextElementSibling;
    if (
      el.classList.contains('MsoCaption') ||
      el.classList.contains('ImageCaption')
    ) {
      let alt = el.textContent;
      alt = alt.trim().replace(/\n/g, ' ');

      let src = img.getAttribute('src');
      src = src.replace(/\.jpg$/g, '.png');
      // decrease digit in the filename by 1 for example image011.png to image010.png and image010.png to image009.png
      // keep the leading zeros
      src = src.replace(/(\d{3})\.png$/, (match, p1) => {
        return `${String(Number(p1) - 1).padStart(3, '0')}.png`;
      });

      const originalSrc = src;

      src = src.replace(/vim-web.fld/g, '/vim');

      img.setAttribute('alt', alt);
      img.setAttribute('src', src);
      files.push([originalSrc, src]);
      el.remove();
    }
  });

  let output = dom.serialize();

  const turndown = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    linkStyle: 'inlined',
  });
  TurndownService.prototype.escape = (text) => text;

  output = turndown.turndown(output);
  output = mergeConsecutiveCodeBlocks(output);
  output = replaceWords(output);
  output = replaceImages(output);
  output = replaceStrangeChars(output);

  // words should be counted as warnings
  const words = {
    pembaca: /pembaca/g,
    kerangkakerja: /kerangkakerja/g,
    'kerangka kerja': /kerangka kerja/g,
    'di mana': /di mana/g,
    'yang mana': /yang mana/g,
    neovim: /neovim/g,
    kursor: /kursor/g,
    '|': /\|/g,
    // starts with : (vim command)
    'vim command': /:\w+/g,
    // inline code
    'inline code': /`[^`]+`/g,
    // block code
    'block code': /```[^`]+```/g,
    // image with <Image...
    image: /<Image src=".*" alt=".*" \/>/g,
    // link
    link: /\[([^\[]+)\](\(.*\))/g,
  };

  for (const [warning, regex] of Object.entries(words)) {
    const matches = output.match(regex);

    if (matches) {
      warnings[warning] = matches.length;
    }
  }

  return {
    input,
    output,
    warnings,
    files,
  };
}

function mergeConsecutiveCodeBlocks(input: string) {
  let output = input.replace(/\n```\n\n```/g, '');

  return output;
}

function replaceWords(input: string) {
  let output = input;

  const words = {
    fail: /berkas/g,
    Fail: /Berkas/g,
    direktori: /folder/g,
    Direktori: /Folder/g,
    'materi belajar': /buku/g,
    'Materi belajar': /Buku/g,
    galat: /\*?error\*?/g,
    Galat: /\*?Error\*?/g,
  };

  for (const [replacement, regex] of Object.entries(words)) {
    output = output.replace(regex, replacement);
  }

  return output;
}

function replaceImages(input) {
  let output = input;

  // replace image with <Image src="..." alt="..." />
  output = output.replace(
    /!\[([^\]]*)\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g,
    '<Image src="$2" alt="$1" />'
  );

  return output;
}

function replaceStrangeChars(input) {
  const str = input;
  const allQuotes = [
    '“', // U+201c
    '”', // U+201d
    '«', // U+00AB
    '»', // U+00BB
    '„', // U+201E
    '“', // U+201C
    '‟', // U+201F
    '”', // U+201D
    '❝', // U+275D
    '❞', // U+275E
    '〝', // U+301D
    '〞', // U+301E
    '〟', // U+301F
    '＂', // U+FF02
  ];

  const stdQuote = '"'; // U+0022

  const normalized = allQuotes.reduce((strNorm, quoteChar) => {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const re = new RegExp(quoteChar, 'g');
    return strNorm.replace(re, stdQuote);
  }, str);

  return normalized;
}
