import { useRouter } from 'next/router';
import Docsearch from './components/docsearch';

export default {
  useNextSeoProps() {
    const { asPath } = useRouter();
    const appName = 'belajarfrontend.org';

    const seo = {
      titleTemplate: `%s – ${appName}`,
      openGraph: {
        type: 'website',
        url: 'https://belajarfrontend.org',
        site_name: appName,
        description: 'Belajar pengembangan front-end dengan penuh kebebasan.',
        images: [
          {
            url: 'https://belajarfrontend.org/belajarfrontend-og.png',
          },
        ],
      },
    };

    let seoPage = {};

    if (asPath.startsWith('/vim')) {
      seoPage = {
        titleTemplate: `%s – Vim Esensial – ${appName}`,
      };
    } else if (asPath.startsWith('/nextjs')) {
      seoPage = {
        titleTemplate: `%s – Next.js Esensial – ${appName}`,
      };
    } else if (asPath.startsWith('/tailwind')) {
      seoPage = {
        titleTemplate: `%s – Tailwind Esensial – ${appName}`,
      };
    }

    if (asPath !== '/') {
      seoPage = {
        ...seoPage,
        openGraph: {
          ...seo.openGraph,
          url: `https://belajarfrontend.org${asPath}`,
        },
      };
    }

    return {
      ...seo,
      ...seoPage,
    };
  },
  logo: (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src="/logo.png" width="35" alt="logo belajarfrontend.org" />
      <span
        style={{ marginLeft: 10, fontWeight: 600 }}
        className="hidden md:block">
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
      <meta
        name="description"
        content="Belajar pengembangan front-end dengan penuh kebebasan."
      />
    </>
  ),
};
