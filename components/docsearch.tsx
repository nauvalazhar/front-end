import { useEffect } from 'react';
import docsearch from '@docsearch/js';
import '@docsearch/css';

export default function () {
  useEffect(() => {
    docsearch({
      appId: 'RBHYZRN70C',
      apiKey: '5b4a285a59a1308fc73f2b3e3a8077dd',
      indexName: 'belajarfrontend',
      container: '#docsearch',
      placeholder: 'Cari materi tertentu ...',
      translations: {
        button: {
          buttonText: 'Pencarian',
        },
        modal: {
          startScreen: {
            recentSearchesTitle: 'Pencarian Terakhir',
          },
          noResultsScreen: {
            noResultsText: 'Tidak ada hasil untuk ',
            suggestedQueryText: 'Coba cari dengan kata kunci lain',
          },
        },
      },
    });
  }, []);

  return <div id="docsearch"></div>;
}
