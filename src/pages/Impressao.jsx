import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildFASHtml } from '@/components/fas/FASDocumento';

// Mapa de tipo -> { entity, buildHtml }
// Para adicionar novos formulários, basta incluir uma nova entrada aqui.
const RENDERERS = {
  fas: {
    entity: 'FAS',
    buildHtml: buildFASHtml,
  },
};

export default function Impressao() {
  const { tipo, id } = useParams();

  useEffect(() => {
    const renderer = RENDERERS[tipo];
    if (!renderer) {
      document.open();
      document.write('<h2 style="font-family:Arial;padding:40px">Tipo de formulário desconhecido.</h2>');
      document.close();
      return;
    }

    base44.entities[renderer.entity].get(id).then(data => {
      const html = renderer.buildHtml(data);
      document.open();
      document.write(html);
      document.close();
    });
  }, [tipo, id]);

  return null;
}