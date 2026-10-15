import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Lobby: fila/sala atual, partida retomável, V/D e ranking. Polling também mantém o lugar na fila. */
export function useOnlineLobby(enabled: boolean, waiting: boolean) {
  return useQuery({ ...orpc.online.lobby.queryOptions(), enabled, refetchInterval: waiting ? 2000 : 15000, refetchIntervalInBackground: true, retry: 1 });
}
/** Estado autoritativo da partida; o servidor aplica prazos vencidos ao responder. */
export function useOnlineMatch(id: string | null, mine: boolean) {
  return useQuery({ ...orpc.online.state.queryOptions({ input: { id: id ?? "" } }), enabled: !!id, refetchInterval: mine ? 5000 : 1500, refetchIntervalInBackground: true, retry: 2 });
}
function useLobbyInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: orpc.online.lobby.key() });
}
export function useQueueOnline() {
  const done = useLobbyInvalidate();
  return useMutation(orpc.online.queue.mutationOptions({ onSuccess: done }));
}
export function useJoinRoom() {
  const done = useLobbyInvalidate();
  return useMutation(orpc.online.join.mutationOptions({ onSuccess: done }));
}
export function useCancelQueue() {
  const done = useLobbyInvalidate();
  return useMutation(orpc.online.cancel.mutationOptions({ onSuccess: done }));
}
export function useOnlineAction() {
  const qc = useQueryClient();
  return useMutation(orpc.online.action.mutationOptions({
    onSuccess: view => qc.setQueryData(orpc.online.state.queryKey({ input: { id: view.id } }), view),
  }));
}
export function useSurrender() {
  const qc = useQueryClient();
  return useMutation(orpc.online.surrender.mutationOptions({
    onSuccess: view => { qc.setQueryData(orpc.online.state.queryKey({ input: { id: view.id } }), view); void qc.invalidateQueries({ queryKey: orpc.online.lobby.key() }); },
  }));
}
