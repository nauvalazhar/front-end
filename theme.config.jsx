import { useRouter } from 'next/router';
import Docsearch from './components/docsearch';

export default {
  useNextSeoProps() {
    const { asPath } = useRouter();
    const appName = 'belajarfrontend.org';

    if (asPath.startsWith('/vim')) {
      return {
        titleTemplate: `%s – Vim Esensial – ${appName}`,
      };
    } else if (asPath.startsWith('/nextjs')) {
      return {
        titleTemplate: `%s – Next.js Esensial – ${appName}`,
      };
    } else if (asPath.startsWith('/tailwind')) {
      return {
        titleTemplate: `%s – Tailwind Esensial – ${appName}`,
      };
    }

    return {
      titleTemplate: `%s – ${appName}`,
    };
  },
  logo: (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src="/logo.png" width="35" />
      <span style={{ marginLeft: 10, fontWeight: 600 }}>
        belajarfrontend.org
      </span>
    </div>
  ),
  project: {
    link: 'https://github.com/nauvalazhar/front-end',
  },
  search: {
    component: <Docsearch />,
  },
  docsRepositoryBase: 'https://github.com/nauvalazhar/front-end/tree/main',
  toc: {
    title: 'Dalam Bab Ini',
    backToTop: true,
  },
  editLink: {
    text: 'Edit halaman ini →',
  },
  feedback: {
    content: null,
  },
  footer: {
    text: 'Nauval © 2024',
  },
  head: (
    <>
      <meta name="shortcut icon" content="/favicon.ico" />
    </>
  ),
};
