export type Game = {
    title: string;
    description: string;
    gameAddress: string;
    gameBackground: string;
    animatedBackground?: string;
    card: string;
    banner: string;
    advanceToNextStateAsset?: string;
    themeColorBackground: string;
    song?: string;
    payouts: PayoutStructure;
};

export type PayoutStructure = {
    [key: number]: {
        [key: number]: {
            [key: number]: number;
        };
    };
};

export const dartsGame: Game = {
    title: "Darts",
    description: "Throw a dart at the board and land on a multiplier to win!",
    gameAddress: "0x0000000000000000000000000000000000000000",
    gameBackground: "/darts-assets/background.png",
    card: "/darts-assets/card.png",
    banner: "/darts-assets/banner.png",
    themeColorBackground: "#22C55E",
    payouts: {},
};

export const getPayout = (
    payouts: PayoutStructure,
    result0: number,
    result1: number,
    result2: number
): number => {
    return payouts[result0]?.[result1]?.[result2] || 0;
};

export const randomBytes = (amount: number) =>
    crypto.getRandomValues(new Uint8Array(amount));
