/** MÓDULO: Centraliza listas fixas, opções de formulário, imagens e contas demonstrativas. */
import { image } from "./images";
import type { LeisureSpace, PackageKind, PackageSize, Role, Screen } from "./types";

/** Foto do prédio (tela inicial, login e painel do morador). Arquivo: assets/imagens/predio */
export const BUILDING_IMAGE = image("predio");

/** Apartamentos: 301–304, 401–404 ... 2401–2404 (andares 3 a 24, 4 por andar). */
export const APARTMENTS: string[] = Array.from({ length: 22 * 4 }, (_, i) => {
  const floor = 3 + Math.floor(i / 4);
  const unit = (i % 4) + 1;
  return `${floor}${String(unit).padStart(2, "0")}`;
});

/** Espaços de lazer. O campo `image` é o nome do arquivo em assets/imagens. */
export const LEISURE_SPACES: LeisureSpace[] = [
  { id: "espaco-grill",   name: "Espaço Grill",   description: "Churrasqueira para confraternizações", image: image("espaco-grill") },
  { id: "salao-de-festas", name: "Salão de Festas", description: "Ideal para eventos e comemorações",   image: image("salao-de-festas") },
  { id: "espaco-gourmet", name: "Espaço Gourmet", description: "Cozinha equipada para receber",        image: image("espaco-gourmet") },
  { id: "brinquedoteca",  name: "Brinquedoteca",  description: "Diversão e segurança para as crianças", image: image("brinquedoteca") },
  { id: "academia",       name: "Academia",       description: "Equipamentos para o seu treino",       image: image("academia") },
  { id: "sauna",          name: "Sauna",          description: "Área de relaxamento; foto disponível da hidromassagem/spa", image: image("sauna") },
  { id: "salao-de-jogos", name: "Salão de Jogos", description: "Jogos e entretenimento",               image: image("salao-de-jogos") },
  { id: "piscina",        name: "Piscina",        description: "Lazer e descanso",                     image: image("piscina") },
];

/** Opções do cadastro de encomendas (somente portaria). */
export const PACKAGE_KINDS: PackageKind[] = ["Caixa", "Embalagem", "Pacote"];
export const PACKAGE_SIZES: PackageSize[] = ["Extra pequeno", "Pequeno", "Médio", "Grande", "Extra grande"];

export const FAMILY_RELATIONS = ["Pai", "Mãe", "Filho(a)", "Avô", "Avó", "Cônjuge", "Outro"];

/** Tela inicial de cada perfil depois do login. */
export const HOME_SCREEN: Record<Role, Screen> = {
  morador: "home",
  portaria: "access",
};

/** Perfis exibidos no login. */
export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "morador", label: "Morador" },
  { value: "portaria", label: "Portaria" },
];

/**
 * Contas do modo demonstração (sem Supabase).
 * Ficam apenas aqui: não são exibidas nem preenchidas na tela de login.
 */
export const DEMO_ACCOUNTS: Record<string, { password: string; name: string; role: Role }> = {
  morador:  { password: "marista123",  name: "Vinícius Oliveira",     role: "morador" },
  portaria: { password: "portaria123", name: "Equipe da Portaria",    role: "portaria" },
};
