import { useState } from 'react';
import { X, Pencil, AlertTriangle, CheckCircle, History, CheckSquare, Square, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DocUploadSection from './DocUploadSection';
import VerificacaoDiariaModal from './VerificacaoDiariaModal';
import VerificacaoDiariaList from './VerificacaoDiariaList';
import {
  STATUS_EQUIPAMENTO,
  PERIODICIDADE_LABELS,
  isCalibracaoVencida,
  isCalibracaoProxima,
} from '@/utils/equipamentoHelpers';

const InfoRow = ({ label, value, mono }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
    <p className={`text-sm text-foreground ${mono ? 'font-mono-data' : ''}`}>{value || '—'}</p>
  </div>
);

export default function EquipamentoDetalhes({ equipamento: initialEquipamento, canEdit, user, onClose, onEdit }) {
  const [eq, setEq] = useState(initialEquipamento);
  const [verificacaoOpen, setVerificacaoOpen] = useState(false);
  const [verificacaoRefresh, setVerificacaoRefresh] = useState(0);

  const status = STATUS_EQUIPAMENTO[eq.status] || STATUS_EQUIPAMENTO.em_uso;
  const vencida = isCalibracaoVencida(eq.validade_calibracao);
  const proxima = isCalibracaoProxima(eq.validade_calibracao);

  // Regras: laboratoristas podem iniciar verificação diária apenas em equipamentos em uso
  const role = user?.role || 'auxiliar';
  const isLaboratorista = role === 'laboratorista' || role === 'auxiliar';
  const podeIniciarVerificacaoDiaria = isLaboratorista && eq.status === 'em_uso' && eq.obrigatorio_verificacao_diaria;

  const handleDocUpdate = (field, novosDoc) => {
    setEq(e => ({ ...e, [field]: novosDoc }));
  };

  const handleVerificacaoSaved = () => {
    setVerificacaoOpen(false);
    setVerificacaoRefresh(r => r + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-6">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-foreground font-mono-data">{eq.identificacao_interna}</h2>
              <Badge className={status.color}>{status.label}</Badge>
              {vencida && (
                <Badge className="bg-red-100 text-red-700 gap-1">
                  <AlertTriangle className="w-3 h-3" /> Calibração vencida
                </Badge>
              )}
              {!vencida && proxima && (
                <Badge className="bg-orange-100 text-orange-700 gap-1">
                  <AlertTriangle className="w-3 h-3" /> Calibração próxima
                </Badge>
              )}
              {!vencida && !proxima && eq.validade_calibracao && (
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle className="w-3 h-3" /> Calibração em dia
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{eq.nome}</p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {canEdit && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dados gerais */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InfoRow label="Categoria" value={eq.categoria} />
            <InfoRow label="Precisão" value={eq.precisao} />
            <InfoRow label="Periodicidade Verificação" value={PERIODICIDADE_LABELS[eq.periodicidade_verificacao]} />
            <InfoRow
              label="Data de Calibração"
              value={eq.data_calibracao ? new Date(eq.data_calibracao).toLocaleDateString('pt-BR') : null}
            />
            <InfoRow
              label="Validade da Calibração"
              value={eq.validade_calibracao ? new Date(eq.validade_calibracao).toLocaleDateString('pt-BR') : null}
            />
          </div>
        </div>

        {/* Obrigatoriedade de verificações */}
        <div className="px-6 pb-5 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            {eq.obrigatorio_verificacao_diaria
              ? <CheckSquare className="w-4 h-4 text-primary" />
              : <Square className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm text-foreground">Verificação diária obrigatória</span>
          </div>
          <div className="flex items-center gap-2">
            {eq.obrigatorio_verificacao_intermediaria
              ? <CheckSquare className="w-4 h-4 text-primary" />
              : <Square className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm text-foreground">Verificação intermediária obrigatória</span>
          </div>
        </div>

        <Separator />

        {/* Verificações Diárias */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Verificações Internas Diárias</h3>
            {podeIniciarVerificacaoDiaria && (
              <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setVerificacaoOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                Nova Verificação
              </Button>
            )}
          </div>
          {!eq.obrigatorio_verificacao_diaria && (
            <p className="text-xs text-muted-foreground">Este equipamento não requer verificação diária.</p>
          )}
          {eq.obrigatorio_verificacao_diaria && (
            <VerificacaoDiariaList equipamentoId={eq.id} refreshKey={verificacaoRefresh} />
          )}
        </div>

        <Separator />

        {/* Documentos */}
        <div className="px-6 py-5 space-y-6">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Documentos Anexados</h3>

          <DocUploadSection
            title="Certificado de Calibração"
            field="docs_certificado_calibracao"
            docs={eq.docs_certificado_calibracao || []}
            equipamentoId={eq.id}
            canEdit={canEdit}
            onUpdate={handleDocUpdate}
          />

          <Separator />

          <DocUploadSection
            title="Verificação Interna Intermediária"
            field="docs_verificacao_intermediaria"
            docs={eq.docs_verificacao_intermediaria || []}
            equipamentoId={eq.id}
            canEdit={canEdit}
            onUpdate={handleDocUpdate}
          />
        </div>

        {/* Histórico de status */}
        {(eq.historico_status || []).length > 0 && (
          <>
            <Separator />
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Histórico de Status</h3>
              </div>
              <div className="space-y-1.5">
                {[...(eq.historico_status || [])].sort((a, b) => new Date(b.data) - new Date(a.data)).map((h, i) => {
                  const cfg = STATUS_EQUIPAMENTO[h.status];
                  return (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border">
                      <div className="flex-shrink-0 mt-0.5">
                        <Badge className={`${cfg?.color || 'bg-gray-100 text-gray-600'} text-xs`}>
                          {cfg?.label || h.status}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {h.data ? new Date(h.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                        </p>
                        {h.observacao && (
                          <p className="text-xs text-muted-foreground mt-0.5">{h.observacao}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="px-6 py-3 border-t flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>

      {verificacaoOpen && (
        <VerificacaoDiariaModal
          open={verificacaoOpen}
          onClose={() => setVerificacaoOpen(false)}
          equipamento={eq}
          user={user}
          onSaved={handleVerificacaoSaved}
        />
      )}
    </div>
  );
}