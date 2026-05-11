import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Package, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_CONFIG = {
  aberta: { label: 'Aberta', color: 'bg-blue-100 text-blue-700' },
  material_recebido: { label: 'Material Recebido', color: 'bg-yellow-100 text-yellow-700' },
  finalizada: { label: 'Finalizada', color: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
};

const InfoRow = ({ label, value, mono }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
    <p className={`text-sm text-foreground ${mono ? 'font-mono-data' : ''}`}>{value || '—'}</p>
  </div>
);

const BoolRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-foreground">{label}</span>
    <Badge className={value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}>
      {value ? 'Sim' : 'Não'}
    </Badge>
  </div>
);

const hoje = () => new Date().toISOString().split('T')[0];

export default function DetalhesFAS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fas, setFas] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role || 'auxiliar';
  const isGestor = role === 'admin' || role === 'gestor';
  const isTecnico = role === 'tecnico';

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.FAS.filter({ id });
      setFas(data[0] || null);
      setLoading(false);
    };
    load();
  }, [id]);

  const marcarMaterialRecebido = async () => {
    const andamento = (fas.andamento || []).map(a =>
      a.atividade === 'Recebimento do Material' ? { ...a, data: hoje(), concluida: true } : a
    );
    await base44.entities.FAS.update(fas.id, { status: 'material_recebido', andamento });
    setFas(f => ({ ...f, status: 'material_recebido', andamento }));
  };

  const finalizarFAS = async () => {
    const andamento = (fas.andamento || []).map(a =>
      a.atividade === 'Envio do Relatório' ? { ...a, data: hoje(), concluida: true } : a
    );
    await base44.entities.FAS.update(fas.id, { status: 'finalizada', andamento });
    setFas(f => ({ ...f, status: 'finalizada', andamento }));
  };

  const cancelarFAS = async () => {
    await base44.entities.FAS.update(fas.id, { status: 'cancelada' });
    setFas(f => ({ ...f, status: 'cancelada' }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (!fas) return (
    <div className="p-6 text-center text-muted-foreground">FAS não encontrada.</div>
  );

  const status = STATUS_CONFIG[fas.status] || STATUS_CONFIG.aberta;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fas')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono-data">{fas.numero_fas || fas.numero_proposta}</h1>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Proposta: {fas.numero_proposta}</p>
        </div>

        {/* Ações do Gestor */}
        {isGestor && fas.status === 'aberta' && (
          <div className="flex gap-2 flex-wrap">
            <Button className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={marcarMaterialRecebido}>
              <Package className="w-4 h-4" />
              Confirmar Recebimento
            </Button>
            <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={cancelarFAS}>
              <XCircle className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        )}
        {isGestor && fas.status === 'material_recebido' && (
          <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={finalizarFAS}>
            <FileCheck className="w-4 h-4" />
            Enviar Relatório e Finalizar
          </Button>
        )}
      </div>

      {/* Anonimato para Técnico */}
      {isTecnico && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <span className="text-amber-700 font-bold font-mono-data text-lg">{fas.codigo_amostra}</span>
              </div>
              <div>
                <p className="font-semibold text-amber-900 text-sm">Código da Amostra</p>
                <p className="text-amber-700 text-xs">Identificação anônima para preservar a imparcialidade do ensaio.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Andamento das Atividades */}
      {fas.andamento && fas.andamento.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Andamento das Atividades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Atividade</th>
                  <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Data</th>
                  <th className="px-4 py-2 text-center font-semibold text-muted-foreground">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fas.andamento.map((a, idx) => (
                  <tr key={idx} className={a.concluida ? 'bg-green-50/40' : ''}>
                    <td className="px-4 py-2.5 font-medium text-foreground">{a.atividade}</td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono-data text-xs">
                      {a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {a.concluida
                        ? <Badge className="bg-green-100 text-green-700 text-xs">Concluído</Badge>
                        : <Badge className="bg-gray-100 text-gray-500 text-xs">Pendente</Badge>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Dados do Cliente — oculto para técnico */}
      {!isTecnico && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Razão Social" value={fas.razao_social} />
              <InfoRow label="CNPJ" value={fas.cnpj} mono />
              <InfoRow label="Responsável" value={fas.responsavel} />
              <InfoRow label="E-mail de Envio" value={fas.email_envio} />
              <InfoRow label="Nome do Solicitante" value={fas.nome_solicitante} />
              <InfoRow label="Data da Solicitação" value={fas.data_solicitacao ? new Date(fas.data_solicitacao).toLocaleDateString('pt-BR') : null} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objetivo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Objetivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">{fas.objetivo || '—'}</p>
        </CardContent>
      </Card>

      {/* Ensaios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ensaios Solicitados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!fas.itens || fas.itens.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">Nenhum ensaio vinculado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Ensaio</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Norma</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Qtd</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Unidade</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fas.itens.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">{item.ensaio_nome || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono-data text-xs">{item.norma || '—'}</td>
                    <td className="px-4 py-3 text-center font-mono-data">{item.quantidade}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.unidade || '—'}</td>
                    <td className="px-4 py-3 text-center font-mono-data text-muted-foreground">{item.prazo_dias ? `${item.prazo_dias}d` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Condições */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Condições e Requisitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            <BoolRow label="Exige ART (Anotação de Responsabilidade Técnica)" value={fas.exige_art} />
            <BoolRow label="Exige Símbolo de Acreditação" value={fas.exige_simbolo} />
            <BoolRow label="Declaração de Confidencialidade" value={fas.declaracao_confidencialidade} />
          </div>
          {fas.observacoes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
              <p className="text-sm text-foreground">{fas.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}