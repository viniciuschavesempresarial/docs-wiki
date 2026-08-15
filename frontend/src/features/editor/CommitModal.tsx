import React, { useState } from 'react';
import { GitCommit, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (commitMessage: string) => Promise<void>;
  isLoading?: boolean;
}

export const CommitModal: React.FC<CommitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) {
      setError('A mensagem de commit é obrigatória para o versionamento imutável.');
      return;
    }
    setError('');
    await onConfirm(commitMessage.trim());
    setCommitMessage('');
    onClose();
  };

  return (
    <Modal
      id="modal-commit-versao"
      data-testid="modal-commit-versao"
      isOpen={isOpen}
      onClose={onClose}
      title="Salvar Nova Versão (Commit Git-like)"
    >
      <form id="form-commit-modal" data-testid="form-commit-modal" onSubmit={handleConfirm} className="space-y-4">
        <p className="text-xs text-slate-400">
          Cada salvamento gera um hash SHA-256 único e uma versão incremental imutável na base de dados.
        </p>

        {error && (
          <div
            id="alert-commit-error"
            data-testid="alert-commit-error"
            className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          id="input-commit-message"
          data-testid="input-commit-message"
          type="text"
          label="Mensagem do Commit"
          placeholder="ex: Atualiza seção de microsserviços e corrige frontmatter"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          required
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            id="btn-cancelar-commit"
            data-testid="btn-cancelar-commit"
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            id="btn-confirmar-commit"
            data-testid="btn-confirmar-commit"
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            <GitCommit className="w-4 h-4 mr-2" />
            Confirmar Commit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
