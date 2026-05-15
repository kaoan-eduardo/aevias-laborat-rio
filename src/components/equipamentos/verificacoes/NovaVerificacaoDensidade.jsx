import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { currentMonthSP } from '@/lib/dateUtils';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RubricaButton from './RubricaButton';
import AnaliseCritica from './AnaliseCritica';
import { avaliarSituacaoDensidade, getHorarioSP, buildRegistros } from '@/business-rules/verificacoes';
import { listarVidrarias } from '@/services/equipamentosService';

export default function NovaVerificacaoDensidade({ onBack, onSaved }) {
  const { user } = useAuth();

  const [mesAno, setMesAno] = useState('');
  const [outrasInfo, setOutrasInfo] = useState('');
  const [resultadoGeral, setResultadoGeral] = useState('em_andamento');
  const [eqRefId, setEqRefId] = useState('');
  const [eqRefDesc, setEqRefDesc] = useState('');
  const [eqRefCal, setEqRefCal] = useState('');
  const [vidrarias, setVidrarias] = useState([]);
  const [solucaoDesc, setSolucaoDesc] = useState('');
  const [solucaoLote, setSolucaoLote] = useState('');
  const [registros, setRegistros] = useState(buildRegistros());
  const [acResponsavel, setAcResponsavel] = useState('');
  const [acData, setAcData] = useState('');
  const [acRubricaUrl, setAcRubricaUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMesAno(currentMonthSP());
    listarVidrarias().then(setVidrarias);
  }, []);

  const diasNoMes = mesAno ?
  new Date(Number(mesAno.split('-')[0]), Number(mesAno.split('-')[1]), 0).getDate() :
  31;

  const setRegDensidade = (idx, field, value, currentReg) => {
    const updated = { ...currentReg, [field]: value };
    if (field === 'temperatura') {
      if (value !== '' && !currentReg.horario) {
        updated.horario = getHorarioSP();
      } else if (value === '') {
        updated.horario = '';
      }
    }
    updated.situacao = avaliarSituacaoDensidade(solucaoDesc, updated.densidade_com_amostra, updated.densidade_sem_amostra);
    setRegistros((prev) => prev.map((r, i) => i === idx ? updated : r));
  };

  const confirmarRubrica = (idx, dataUrl) => {
    setRegistros((prev) => prev.map((r, i) =>
    i === idx ?
    { ...r, responsavel: r.responsavel || user?.nome_exibicao || user?.full_name || '', rubrica_url: dataUrl } :
    r
    ));
  };

  const handleSave = async () => {
    if (!mesAno) return;
    setSaving(true);
    await base44.entities.VerificacaoDiaria.create({
      equipamento_id: '',
      equipamento_identificacao: '—',
      equipamento_nome: 'Verificação de Densidade',
      tipo: 'densidade',
      mes_ano: mesAno,
      outras_informacoes: outrasInfo,
      resultado_geral: resultadoGeral,
      eq_referencia_identificacao: eqRefId,
      eq_referencia_descricao: eqRefDesc,
      eq_referencia_data_calibracao: eqRefCal,
      solucao_descricao: solucaoDesc,
      solucao_lote: solucaoLote,
      registros,
      analise_critica_responsavel: acResponsavel,
      analise_critica_data: acData,
      analise_critica_rubrica_url: acRubricaUrl
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Verificação de Densidade</h1>
            <p className="text-sm text-muted-foreground">Verificação sem LC vinculado</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !mesAno}>
            {saving ? 'Salvando...' : 'Salvar Verificação'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Mês/Ano *</Label>
          <Input type="month" value={mesAno} onChange={(e) => setMesAno(e.target.value)} />
        </div>
        









        
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipamento de Referência</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Identificação</Label>
            {vidrarias.length > 0 ?
            <Select value={eqRefId} onValueChange={(val) => {
              const eq = vidrarias.find((p) => p.identificacao_interna === val);
              setEqRefId(val);
              setEqRefDesc(eq?.nome || '');
              setEqRefCal(eq?.data_calibracao || '');
            }}>
                <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Selecione a vidraria" /></SelectTrigger>
                <SelectContent>
                  {vidrarias.map((p) =>
                <SelectItem key={p.id} value={p.identificacao_interna}>{p.identificacao_interna} — {p.nome}</SelectItem>
                )}
                </SelectContent>
              </Select> :

            <div className="space-y-1">
                <Input value={eqRefId} onChange={(e) => setEqRefId(e.target.value)} placeholder="ID do equip. referência" className="text-xs" />
                <p className="text-xs text-amber-600">Nenhuma vidraria encontrada nos equipamentos.</p>
              </div>
            }
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Input value={eqRefDesc} onChange={(e) => setEqRefDesc(e.target.value)} className="text-xs" disabled={!!eqRefId} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data de Calibração</Label>
            <Input type="date" value={eqRefCal} onChange={(e) => setEqRefCal(e.target.value)} className="text-xs" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Solução Verificada</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição da solução</Label>
            <Select value={solucaoDesc} onValueChange={setSolucaoDesc}>
              <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Selecione a solução" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sulfato de Sódio">Sulfato de Sódio</SelectItem>
                <SelectItem value="Sulfato de Magnésio">Sulfato de Magnésio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Lote</Label>
            <Input value={solucaoLote} onChange={(e) => setSolucaoLote(e.target.value)} placeholder="Lote" className="text-xs" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Variação permitida: Sulfato de Sódio: 1,151–1,174 · Magnésio: 1,295–1,308</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Checagem Diária</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-2 py-2 text-center font-semibold w-10">Dia</th>
                <th className="px-2 py-2 text-left font-semibold">Horário</th>
                <th className="px-2 py-2 text-left font-semibold">Temperatura</th>
                <th className="px-2 py-2 text-left font-semibold">Dens. c/ Amostra</th>
                <th className="px-2 py-2 text-left font-semibold">Dens. s/ Amostra</th>
                <th className="px-2 py-2 text-center font-semibold">Situação</th>
                <th className="px-2 py-2 text-left font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registros.slice(0, diasNoMes).map((r, i) =>
              <tr key={i} className={r.situacao === 'reprovado' ? 'bg-red-50' : 'hover:bg-muted/20'}>
                  <td className="px-2 py-1 text-center font-mono-data text-muted-foreground">{r.dia}</td>
                  <td className="px-1 py-1"><Input value={r.horario} onChange={(e) => setRegDensidade(i, 'horario', e.target.value, r)} className="h-6 text-xs px-1.5" placeholder="HH:MM" /></td>
                  <td className="px-1 py-1"><Input value={r.temperatura} onChange={(e) => setRegDensidade(i, 'temperatura', e.target.value, r)} className="h-6 text-xs px-1.5" placeholder="°C" /></td>
                  <td className="px-1 py-1"><Input value={r.densidade_com_amostra} onChange={(e) => setRegDensidade(i, 'densidade_com_amostra', e.target.value, r)} className="h-6 text-xs px-1.5" placeholder="g/cm³" /></td>
                  <td className="px-1 py-1"><Input value={r.densidade_sem_amostra} onChange={(e) => setRegDensidade(i, 'densidade_sem_amostra', e.target.value, r)} className="h-6 text-xs px-1.5" placeholder="g/cm³" /></td>
                  <td className="px-1 py-1 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.situacao === 'aprovado' ? 'bg-green-100 text-green-700' : r.situacao === 'reprovado' ? 'bg-red-100 text-red-700' : 'text-muted-foreground'}`}>
                      {r.situacao === 'aprovado' ? 'Aprovado' : r.situacao === 'reprovado' ? 'Reprovado' : '—'}
                    </span>
                  </td>
                  <td className="px-1 py-1">
                    <RubricaButton
                    nome={r.responsavel || user?.nome_exibicao || user?.full_name || ''}
                    rubricaUrl={r.rubrica_url}
                    responsavel={r.responsavel}
                    disabled={false}
                    onConfirm={(dataUrl) => confirmarRubrica(i, dataUrl)} />
                  
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-1.5 max-w-lg">
        <Label className="text-xs">Outras Informações</Label>
        <Textarea value={outrasInfo} onChange={(e) => setOutrasInfo(e.target.value)} className="h-20 text-xs" />
      </div>

      <AnaliseCritica
        resultadoGeral={resultadoGeral}
        onResultadoChange={setResultadoGeral}
        responsavel={acResponsavel}
        onResponsavelChange={setAcResponsavel}
        data={acData}
        onDataChange={setAcData}
        rubricaUrl={acRubricaUrl}
        onRubricaConfirm={setAcRubricaUrl}
        nomeUsuario={user?.nome_exibicao || user?.full_name || ''} />
      

      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving || !mesAno}>
          {saving ? 'Salvando...' : 'Salvar Verificação'}
        </Button>
      </div>
    </div>);

}