import nextra from 'nextra';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: 'sw.ts',
  swDest: 'public/sw.js',
});

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
});

export default withSerwist(
  withNextra({
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
);
