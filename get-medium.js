const request = require('request');
const turndown = require('turndown');
const fs = require('fs');
const cheerio = require('cheerio');
const slugify = require('slugify');
const uniqid = require('uniqid');
const readline = require('readline');

function getPost(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(body);
    });
  });
}

function saveToFile(markdown, filename) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, markdown, (error) => {
      if (error) {
        reject(error);
      }
      console.log(`Saved to ${filename}`);
      resolve();
    });
  });
}

function getImageFilename(url) {
  // the image url is like this:
  // https://miro.medium.com/v2/resize:fit:1400/format:webp/1*06UMOvj5RLFcF7poD83Qhg.png
  // get the part after `*` and before `.`

  const ext = '.webp';

  const regex = /\d\*([\w-]+)\.\w+$/;
  const match = url.match(regex);
  if (match) {
    return match[1] + ext;
  }

  const id = uniqid();
  let filename = slugify(figcaption, { lower: true });
  filename += '-' + id;
  filename += ext;

  return filename;
}

async function downloadImage(url, path) {
  return new Promise((resolve, reject) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', resolve)
      .on('error', reject);
  });
}

async function parsePost(post, options = {}) {
  const { path } = options;

  const articleContent = post.match(/<article[^>]*>[\s\S]*<\/article>/)[0];
  const $ = cheerio.load(articleContent);

  const title = $('h1').eq(0).text();

  // remove unwanted elements
  $('h1').eq(0).remove();
  $('h2').eq(0).remove();
  $('.speechify-ignore').eq(0).remove();
  $('figure').eq(0).remove();

  const article = $.html();

  // convert to markdown
  const turndownService = new turndown({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
  });
  turndown.prototype.escape = (text) => {
    return text;
  };

  turndownService.addRule('pre', {
    filter: 'pre',
    replacement: (content, node) => {
      console.log(node.textContent);
      let lang = 'tsx';
      let attrs = '';

      // if content contains 'npm', 'npx', 'git'
      if (/npm|npx|git/.test(content)) {
        lang = 'bash';
      }

      // if first line contains something like '// dirname/index.tsx'
      // get the content after '//', it's filename
      // and remove the first line
      const firstLine = content.split('\n')[0];
      const match = firstLine.match(/\/\/ (.+)/);
      if (match) {
        attrs = ` filename="${match[1].trim()}"`;
        content = content.replace(firstLine + '\n', '');
        content = content.trim();
      }

      return '```' + lang + attrs + '\n' + content + '\n```';
    },
  });

  turndownService.addRule('figure', {
    filter: 'figure',
    replacement: (content, node) => {
      const srcset = node.querySelector('source').getAttribute('srcset');
      const figcaption = node.querySelector('figcaption').textContent;

      // get the last image in srcset
      const imageUrl = srcset.split(',');
      const lastImage = imageUrl[imageUrl.length - 1].trim().split(' ')[0];

      // download image
      const filename = getImageFilename(lastImage);
      const imagepath = `${path}/${filename}`;
      console.log('Downloading image:');
      console.log('From:', lastImage);
      console.log('To:', imagepath);
      console.log('Caption:', figcaption);
      console.log('-'.repeat(20));
      downloadImage(lastImage, imagepath);

      // imagepath without `public/`
      const imagesrc = imagepath.replace(/^public\//, '');

      return `\n<Image src="/${imagesrc}" alt="${figcaption}" />`;
    },
  });

  turndownService.addRule('increaseHeading', {
    filter: ['h1', 'h2', 'h3'],
    replacement: (content, node) => {
      const tagName = node.tagName.toLowerCase();
      const level = parseInt(tagName[1]) + 1;

      return `${'#'.repeat(level)} ${content}`;
    },
  });

  let markdown = turndownService.turndown(article);

  // add title at the top
  markdown = `# ${title}\n\n` + markdown;

  // check if there are any images from markdown
  // if there are, then add the import statement
  if (markdown.includes('<Image')) {
    markdown = `import { Image } from '@/components/image';\n\n` + markdown;
  }

  return markdown;
}

function parseUrl(url) {
  const urlObj = new URL(url);
  let slug = urlObj.pathname.split('/').pop();

  // remove the last '-' and the words after it
  slug = slug.replace(/-\w+$/, '');

  return {
    slug,
    url,
  };
}

async function convert(url) {
  // get url from command line
  if (!url) {
    console.error('Please provide a URL');
    process.exit(1);
  }

  const parsedUrl = parseUrl(url);

  const wd = `public/${parsedUrl.slug}`;

  // make directory if not exists
  if (!fs.existsSync(wd)) {
    fs.mkdirSync(wd, { recursive: true });
  }

  // get the post
  console.log(`Getting post from ${url}`);
  const post = await getPost(url);

  // parse the post
  const markdown = await parsePost(post, {
    path: wd,
  });

  // save to file
  const filename = parsedUrl.slug;
  await saveToFile(markdown, `pages/raw/${filename}.mdx`);
}

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the URL: ', async (url) => {
    await convert(url);
    rl.close();
  });
}

main();
