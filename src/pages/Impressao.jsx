import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { buildFASHtml } from '@/components/fas/FASDocumento';
import { buildBalancaHtml, buildTemperaturaHtml, buildDensidadeHtml } from '@/components/equipamentos/verificacoes/VerificacaoDocumento';

// Mapa de tipo -> { entity, buildHtml }
// Para adicionar novos formulários, basta incluir uma nova entrada aqui.
const RENDERERS = {
  fas: {
    entity: 'FAS',
    buildHtml: buildFASHtml,
  },
  verificacao_balanca: {
    entity: 'VerificacaoDiaria',
    buildHtml: buildBalancaHtml,
  },
  verificacao_temperatura: {
    entity: 'VerificacaoDiaria',
    buildHtml: buildTemperaturaHtml,
  },
  verificacao_densidade: {
    entity: 'VerificacaoDiaria',
    buildHtml: buildDensidadeHtml,
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