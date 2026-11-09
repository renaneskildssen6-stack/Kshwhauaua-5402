import Constants from "expo-constants";

/** URL do jogo web (mesma origem da API do template). */
export const GAME_URL = String(
  Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "https://htmlpreview.github.io/?https://raw.githubusercontent.com/eskildssenrenan52-hash/Mechachampionscomplete-5848/e6ce87e/packages/web/dist/inline-eval.html",
).replace(/\/+$/, "");
