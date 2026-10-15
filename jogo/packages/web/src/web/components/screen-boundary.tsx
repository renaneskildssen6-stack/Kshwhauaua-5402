import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Volta para um lugar seguro (cidade/título). */
  onExit: () => void;
  exitLabel?: string;
}
interface State { error: Error | null; attempt: number }

/**
 * Rede de segurança: uma falha de render dentro de um sistema não derruba o jogo inteiro em tela preta.
 * Mostra o painel de recuperação e mantém o save intacto.
 */
export class ScreenBoundary extends Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[MECHA] falha de tela", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return <div key={this.state.attempt} style={{ display: "contents" }}>{this.props.children}</div>;
    return (
      <div className="mc-crash" role="alert">
        <p className="mc-crash-kicker">SISTEMA INSTÁVEL</p>
        <h2>Este painel falhou ao abrir</h2>
        <p>Seu progresso está salvo. Tente de novo ou volte em segurança.</p>
        <code>{this.state.error.message.slice(0, 140)}</code>
        <div>
          <button onClick={() => this.setState((s) => ({ error: null, attempt: s.attempt + 1 }))}>TENTAR DE NOVO</button>
          <button onClick={() => { this.setState({ error: null }); this.props.onExit(); }}>{this.props.exitLabel ?? "VOLTAR À CIDADE"}</button>
        </div>
      </div>
    );
  }
}
