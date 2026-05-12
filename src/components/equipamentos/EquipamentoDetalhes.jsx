import { useState } from 'react';
import { X, Pencil, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DocUploadSection from './DocUploadSection';
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

export default function EquipamentoDetalhes({ equipamento: initialEquipamento, canEdit, onClose, onEdit }) {
  const [eq, setEq] = useState(initialEquipamento);

  const status = STATUS_EQUIPAMENTO[eq.status] || STATUS_EQUIPAMENTO.em_uso;
  const vencida = isCalibracaoVencida(eq.validade_calibracao);
  const proxima = isCalibracaoProxima(eq.validade_calibracao);

  const handleDocUpdate = (field, novosDoc) => {
    setEq(e => ({ ...e, [field]: novosDoc }));
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

          <Separator />

          <DocUploadSection
            title="Verificação Interna Diária"
            field="docs_verificacao_diaria"
            docs={eq.docs_verificacao_diaria || []}
            equipamentoId={eq.id}
            canEdit={canEdit}
            onUpdate={handleDocUpdate}
          />
        </div>

        <div className="px-6 py-3 border-t flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}