import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const EMPTY_FORM = {
  identificacao_interna: '', nome: '', categoria: '', fabricante: '', modelo: '',
  numero_serie: '', software_firmware: '', data_entrada_servico: '', faixa_nominal_maxima: '',
  localizacao: '', responsavel_atualizacao: '', precisao: '', frequencia_calibracao: '',
  unidade_equipamento: '', tolerancia: '',
  pontos_calibracao: [], observacoes: '',
  data_calibracao: '', validade_calibracao: '', periodicidade_verificacao: '', status: 'em_uso',
  obrigatorio_verificacao_diaria: false, obrigatorio_verificacao_intermediaria: false,
  historico_calibracao: [], historico_manutencao: [],
};

export const EMPTY_CAL = {
  numero_certificado: '', orgao: '', titulo: false,
  identificacao_lab: false, selo_rbc: false, identificacao_certificado: false,
  numero_paginas: false, nome_endereco_cliente: false, descricao_item_calibrado: false,
  identificacao_metodo: false, data_calibracao: false, nome_autorizou: false,
  rastreabilidade: false, certificado_aceito: false,
  erros_obtidos: [],
  atende_especificado: false, periodicidade: '', item_em_uso: false,
  observacoes_resultado: '', data_analise: '', responsavel_analise: '',
};

export const EMPTY_MAN = {
  data: '', descricao_problema: '', form011_etiqueta_nc: '', responsavel: '',
  status_form012: '', data_aprovacao: '', fornecedor: '', ordem_compra: '',
  data_ordem_compra: '', nota_fiscal: '', data_recebimento: '', detalhes_execucao: '',
  inspecao_recebimento: '', analise_critica: '', status_form012_final: '',
};

/**
 * Hook que encapsula toda a lógica de estado e persistência do formulário de equipamento.
 */
export function useEquipamentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [originalStatus, setOriginalStatus] = useState('em_uso');
  const [statusChangeDate, setStatusChangeDate] = useState('');
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    base44.entities.Equipamento.get(id).then(eq => {
      if (eq) {
        const pontos = Array.isArray(eq.pontos_calibracao) ? eq.pontos_calibracao : [];
        setForm({ ...EMPTY_FORM, ...eq, pontos_calibracao: pontos });
        setOriginalStatus(eq.status || 'em_uso');
      }
      setIsLoading(false);
    });
  }, [id, isEditing]);

  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const hasStatusChanged = form.status !== originalStatus;

  // ── Calibração ──────────────────────────────────────────────────────────────
  const addCalibration = useCallback(() => {
    setForm(prev => ({
      ...prev,
      historico_calibracao: [...(prev.historico_calibracao || []), { ...EMPTY_CAL }],
    }));
  }, []);

  const removeCalibration = useCallback((index) => {
    setForm(prev => ({
      ...prev,
      historico_calibracao: prev.historico_calibracao.filter((_, i) => i !== index),
    }));
  }, []);

  const updateCalibration = useCallback((index, field, value) => {
    setForm(prev => {
      const updated = [...(prev.historico_calibracao || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, historico_calibracao: updated };
    });
  }, []);

  // ── Manutenção ──────────────────────────────────────────────────────────────
  const addMaintenance = useCallback(() => {
    setForm(prev => ({
      ...prev,
      historico_manutencao: [...(prev.historico_manutencao || []), { ...EMPTY_MAN }],
    }));
  }, []);

  const removeMaintenance = useCallback((index) => {
    setForm(prev => ({
      ...prev,
      historico_manutencao: prev.historico_manutencao.filter((_, i) => i !== index),
    }));
  }, []);

  const updateMaintenance = useCallback((index, field, value) => {
    setForm(prev => {
      const updated = [...(prev.historico_manutencao || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, historico_manutencao: updated };
    });
  }, []);

  // ── Pontos de calibração ────────────────────────────────────────────────────
  const addCalibrationPoint = useCallback(() => {
    setForm(prev => ({
      ...prev,
      pontos_calibracao: [...(prev.pontos_calibracao || []), { ponto: '', criterio: '' }],
    }));
  }, []);

  const removeCalibrationPoint = useCallback((index) => {
    setForm(prev => ({
      ...prev,
      pontos_calibracao: prev.pontos_calibracao.filter((_, i) => i !== index),
    }));
  }, []);

  const updateCalibrationPoint = useCallback((index, field, value) => {
    setForm(prev => {
      const updated = [...(prev.pontos_calibracao || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, pontos_calibracao: updated };
    });
  }, []);

  // ── Salvar ──────────────────────────────────────────────────────────────────
  const isFormValid =
    !!form.identificacao_interna &&
    !!form.nome &&
    !!form.categoria &&
    !!statusChangeDate;

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSaving(true);

    const statusHistory = form.historico_status || [];
    const newStatusHistory = hasStatusChanged
      ? [...statusHistory, { status: form.status, data: statusChangeDate, observacao: statusChangeNote.trim() }]
      : statusHistory;

    const payload = { ...form, historico_status: newStatusHistory };

    if (isEditing) {
      await base44.entities.Equipamento.update(id, payload);
    } else {
      const initialHistory = [{
        status: form.status,
        data: statusChangeDate || new Date().toISOString().split('T')[0],
        observacao: 'Cadastro inicial',
      }];
      await base44.entities.Equipamento.create({ ...payload, historico_status: initialHistory });
    }

    setIsSaving(false);
    navigate('/equipamentos');
  };

  return {
    form,
    isEditing,
    isLoading,
    isSaving,
    isFormValid,
    hasStatusChanged,
    statusChangeDate,
    statusChangeNote,
    setField,
    setStatusChangeDate,
    setStatusChangeNote,
    addCalibration, removeCalibration, updateCalibration,
    addMaintenance, removeMaintenance, updateMaintenance,
    addCalibrationPoint, removeCalibrationPoint, updateCalibrationPoint,
    handleSave,
  };
}