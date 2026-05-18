import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, User, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ACAO_STYLES = {
  criado:     { label: 'Criado',     class: 'bg-green-100 text-green-800 border-green-200' },
  atualizado: { label: 'Atualizado', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  deletado:   { label: 'Deletado',   class: 'bg-red-100 text-red-800 border-red-200' },
};

const ENTIDADES = ['FAS', 'Cliente', 'Equipamento', 'Ensaio', 'Material', 'RecebimentoAmostra', 'VerificacaoDiaria'];

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const acao = ACAO_STYLES[log.acao] || { label: log.acao, class: 'bg-muted text-foreground' };

  const dataHora = log.data_hora ? format(parseISO(log.data_hora), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }) : '—';

  const anteriores = log.valores_anteriores ? JSON.parse(log.valores_anteriores) : null;
  const novos = log.valores_novos ? JSON.parse(log.valores_novos) : null;
  const temDiff = anteriores && novos && log.campos_alterados?.length > 0;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div
        className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => temDiff && setExpanded(!expanded)}
      >
        <Badge className={`${acao.class} border text-xs font-semibold shrink-0`}>{acao.label}</Badge>

        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground shrink-0">{log.entidade}</span>

        <span className="font-medium text-sm flex-1 min-w-0 truncate">{log.entidade_descricao || log.entidade_id}</span>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <User className="w-3.5 h-3.5" />
          <span>{log.usuario_nome || log.usuario_email}</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{dataHora}</span>
        </div>

        {temDiff && (
          <button className="text-muted-foreground hover:text-foreground shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {expanded && temDiff && (
        <div className="border-t border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Campos alterados</p>
          <div className="space-y-2">
            {log.campos_alterados.map(campo => (
              <div key={campo} className="grid grid-cols-[160px_1fr_1fr] gap-3 text-xs">
                <span className="font-mono font-medium text-foreground truncate">{campo}</span>
                <div className="bg-red-50 border border-red-200 rounded px-2 py-1 text-red-700 truncate">
                  {JSON.stringify(anteriores[campo])}
                </div>
                <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-green-700 truncate">
                  {JSON.stringify(novos[campo])}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[160px_1fr_1fr] gap-3 mt-2">
            <span></span>
            <span className="text-xs text-muted-foreground text-center">Antes</span>
            <span className="text-xs text-muted-foreground text-center">Depois</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Auditoria() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroEntidade, setFiltroEntidade] = useState('todas');
  const [filtroAcao, setFiltroAcao] = useState('todas');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    base44.entities.AuditoriaLog.list('-data_hora', 200)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <Shield className="w-12 h-12" />
        <p className="text-lg font-medium">Acesso restrito a administradores</p>
      </div>
    );
  }

  const logsFiltrados = logs.filter(log => {
    const matchBusca = !busca ||
      log.entidade_descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      log.usuario_nome?.toLowerCase().includes(busca.toLowerCase()) ||
      log.usuario_email?.toLowerCase().includes(busca.toLowerCase());
    const matchEntidade = filtroEntidade === 'todas' || log.entidade === filtroEntidade;
    const matchAcao = filtroAcao === 'todas' || log.acao === filtroAcao;
    return matchBusca && matchEntidade && matchAcao;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Auditoria</h1>
          <p className="text-sm text-muted-foreground">Rastreabilidade de alterações — conformidade ISO 17025</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por registro ou usuário..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroEntidade} onValueChange={setFiltroEntidade}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todas as entidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as entidades</SelectItem>
                {ENTIDADES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroAcao} onValueChange={setFiltroAcao}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as ações</SelectItem>
                <SelectItem value="criado">Criado</SelectItem>
                <SelectItem value="atualizado">Atualizado</SelectItem>
                <SelectItem value="deletado">Deletado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : logsFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <FileText className="w-10 h-10" />
          <p>Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{logsFiltrados.length} registro(s)</p>
          {logsFiltrados.map(log => <LogRow key={log.id} log={log} />)}
        </div>
      )}
    </div>
  );
}