import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildFASHtml } from '@/components/fas/FASDocumento';

export default function FASImpressao() {
  const { id } = useParams();

  useEffect(() => {
    base44.entities.FAS.get(id).then(fas => {
      const html = buildFASHtml(fas);
      document.open();
      document.write(html);
      document.close();
    });
  }, [id]);

  return null;
}