import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import express from "express";
import controler from "../controller/controler";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, cb) => {
        const safeName = path.basename(file.originalname).replace(/\s+/g, "_");
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${safeName}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});

export const usersRouter = express.Router();

usersRouter.post("/register", controler.createUser);

usersRouter.get("/:_id", controler.getAllUsersOrByName);

usersRouter.get("/", controler.getAllUsersOrByName);

usersRouter.put("/update/:_id", controler.updateUser);

usersRouter.delete("/delete/:_id", controler.deleteUser);

usersRouter.post("/login", controler.loginUser);

export const templateRouter = express.Router();

templateRouter.post(
    "/create",
    upload.fields([
        { name: "backgroundImg", maxCount: 1 },
        { name: "logoContas", maxCount: 1 },
    ]),
    controler.createTemplate
);

templateRouter.get("/", controler.getAllTemplatesOrById);
templateRouter.get("/:_id", controler.getAllTemplatesOrById);

templateRouter.put(
    "/update/:_id",
    upload.fields([
        { name: "backgroundImg", maxCount: 1 },
        { name: "logoContas", maxCount: 1 },
    ]),
    controler.updateTemplate
);

templateRouter.delete("/delete/:_id", controler.deleteTemplate);

export const exportRouter = Router();

const DEFAULT_BLUE = "#0455A2";
const DEFAULT_GREEN = "#12A84E";
const DEFAULT_LOGO_PATHS = [
    path.resolve(process.cwd(), "src/assets/logo.png"),
    path.resolve(__dirname, "../../../src/assets/logo.png"),
];

const defaultLogoDataUri = (() => {
    for (const logoPath of DEFAULT_LOGO_PATHS) {
        if (fs.existsSync(logoPath)) {
            const base64 = fs.readFileSync(logoPath).toString("base64");
            return `data:image/png;base64,${base64}`;
        }
    }
    return null;
})();

interface ExportPayload {
    name?: string | null;
    email?: string | null;
    sector?: string | null;
    userId?: string | null;
    image?: string | null;
    imageZoom?: number;
    imageOffsetX?: number;
    imageOffsetY?: number;
    backgroundImage?: string | null;
    containerBorderColor?: string | null;
    imageBorderColor?: string | null;
    divisionBarColor?: string | null;
    collaboratorNameColor?: string | null;
    sectorNameColor?: string | null;
    collaboratorInfosColor?: string | null;
    contasLogo?: string | null;
    iconsColor?: string | null;
    showTitle?: boolean;
}

const escapeHtml = (input: string) =>
    input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

// CORREÇÃO 1: Melhorar lógica de gradiente para não duplicar listas de cores
const toGradient = (value: string | null | undefined, fallback: string) => {
    if (!value) return `linear-gradient(${fallback}, ${fallback})`;
    return value.includes("gradient")
        ? value
        : `linear-gradient(${value}, ${value})`;
};

const extractColors = (value: string | null | undefined): string[] => {
    if (!value) return [DEFAULT_BLUE, DEFAULT_GREEN];
    const matches = value.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g);
    if (matches && matches.length > 0) return matches;
    return [value];
};

const buildStopList = (colors: string[]): string => {
    const stops = colors.length === 1 ? [colors[0], colors[0]] : colors;
    return stops
        .map((color, idx) => {
            const offset = stops.length === 1 ? 1 : idx / (stops.length - 1);
            return `<stop offset="${offset}" stop-color="${color}" />`;
        })
        .join("");
};

const buildHtml = (payload: ExportPayload) => {
    const name = escapeHtml(payload.name ?? "");
    const email = escapeHtml(payload.email ?? "");
    const sector = escapeHtml(payload.sector ?? "");
    const userId = escapeHtml(payload.userId ?? "");

    const nameDisplay = name || "Nome e 1° sobrenome";
    const emailDisplay = email || "E-mail";
    const sectorDisplay = sector || "Setor";
    const ramalDisplay = userId || "XXX";

    const backgroundImage = payload.backgroundImage ? `url('${payload.backgroundImage}')` : "none";

    // CORREÇÃO: Fallbacks ajustados para garantir string limpa
    const containerBorder = toGradient(payload.containerBorderColor, DEFAULT_BLUE);

    // Ajuste aqui: se o payload vier vazio, passamos as cores explicitamente para evitar "linear-gradient(blue, green, blue, green)"
    const imageBorderRaw = payload.imageBorderColor || `${DEFAULT_BLUE}, ${DEFAULT_GREEN}`;
    const imageBorder = imageBorderRaw.includes("gradient") ? imageBorderRaw : `linear-gradient(${imageBorderRaw}, ${imageBorderRaw})`;

    const divisionBarRaw = payload.divisionBarColor || `${DEFAULT_GREEN}, ${DEFAULT_BLUE}`;
    const divisionBar = divisionBarRaw.includes("gradient") ? divisionBarRaw : `linear-gradient(${divisionBarRaw}, ${divisionBarRaw})`;

    const nameColor = payload.collaboratorNameColor ?? "#000000";
    const sectorColor = payload.sectorNameColor ?? "#000000";
    const iconColors = extractColors(payload.iconsColor);
    const iconStops = buildStopList(iconColors);
    const iconStart = iconColors[0] ?? DEFAULT_BLUE;
    const iconEnd = iconColors[1] ?? iconStart;

    const iconStopsDetailed = `<stop stop-color="${iconStart}" />` +
        `<stop offset="0.16" stop-color="${iconEnd}" />` +
        `<stop offset="0.75" stop-color="${iconStart}" />` +
        `<stop offset="1" stop-color="${iconEnd}" />`;

    const infoColor = payload.collaboratorInfosColor ?? iconStart ?? "#ffffff";

    const photo = payload.image
        ? `url('${payload.image}')`
        : "linear-gradient(120deg, #222, #444)";

    const imageZoom = Math.max(payload.imageZoom ?? 150, 50);
    const offsetX = payload.imageOffsetX ?? 50;
    const offsetY = payload.imageOffsetY ?? 50;

    const logoSrc = payload.contasLogo || defaultLogoDataUri;
    const logoImg = logoSrc ? `<img src="${logoSrc}" alt="Logo" />` : "";

    const titleBlock =
        payload.showTitle === false
            ? ""
            : `<h2 class="preview-title">Pre-visualizacao</h2>`;

    return `<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        :root {
            --container-border: ${containerBorder};
            --image-border: ${imageBorder};
            --division-bar: ${divisionBar};
            --name-color: ${nameColor};
            --sector-color: ${sectorColor};
            --info-color: ${infoColor};
        }
        * { box-sizing: border-box; }
        p { margin: 0; }
        body {
            margin: 0;
            padding: 16px;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            font-family: 'Montserrat', sans-serif;
            -webkit-print-color-adjust: exact; /* CORREÇÃO 3: Força impressão exata de cores */
            print-color-adjust: exact;
        }
        .preview-root {
            width: 100%;
            max-width: 1248px;
            /* Garante que o container não estique além do necessário para o screenshot */
            display: inline-block; 
        }
        .preview-title {
            margin: 0 0 12px 0;
            font-size: 22px;
            font-weight: 700;
        }
        #signature-preview {
            padding: 24px 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 32px;
            background-color: #fff;
            background-image: ${backgroundImage};
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center;
            box-shadow: 10px 15px 30px #0000001a;
        }
        .preview-image {
            position: relative;
            width: clamp(180px, 22vw, 230px);
            aspect-ratio: 1 / 1;
            border-radius: 50%;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--image-border);
            overflow: hidden;
            flex-shrink: 0;
        }
        .preview-image::after {
            content: "";
            position: absolute;
            inset: 3px;
            border-radius: 50%;
            background-image: ${photo};
            background-repeat: no-repeat;
            background-size: ${imageZoom}% auto;
            background-position: ${offsetX}% ${offsetY}%;
            background-color: #eee; 
        }
        .preview-info {
            width: 100%;
            padding: 3px;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            display: flex;
            background: none;
            flex-grow: 1;
        }
        .preview-info::before {
            content: "";
            position: absolute;
            inset: 0;
            padding: 3px; /* Espessura da borda */
            border-radius: inherit;
            background: var(--container-border);
            pointer-events: none;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; 
            mask-composite: exclude;
        }
        
        .preview-info .inner {
            width: 100%;
            border-radius: 13px;
            padding: 20px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            background: transparent;
            position: relative;
            z-index: 1;
        }
        .info-texts {
            flex: 1; /* Permite ocupar espaço disponível */
            display: flex;
            flex-direction: column;
            gap: 12px;
            color: var(--info-color);
        }
        .container-name-sector {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: fit-content;
        }
        .container-name-sector strong {
            background: var(--division-bar);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            -webkit-text-fill-color: transparent;
            margin: 0 6px;
            display: inline-block; 
        }
        .name-text {
            font-weight: 700;
            font-size: 24px;
            margin-right: 8px;
            color: var(--name-color);
        }
        .sector-text {
            font-size: 20px;
            margin-left: 8px;
            color: var(--sector-color);
        }
        .user-info {
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--info-color);
        }
        .user-info svg { flex-shrink: 0; }
        .location { font-size: 14px; }
        .contas-logo {
            width: 190px;
            display: flex;
            justify-content: center;
            gap: 16px;
            height: 90px;
            align-items: center;
            flex-shrink: 0;
        }
        .contas-logo .divider {
            height: 100%;
            width: 3px;
            background: var(--division-bar);
            border-radius: 8px;
        }
        .contas-logo img {
            width: 80%;
            max-height: 90px;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="preview-root">
        ${titleBlock}
        <div id="signature-preview">
            <div class="preview-image"></div>
            <div class="preview-info">
                <div class="inner">
                    <div class="info-texts">
                        <span class="container-name-sector">
                            <p class="name-text">${nameDisplay}</p>
                            <strong>|</strong>
                            <p class="sector-text">${sectorDisplay}</p>
                        </span>
                        
                        <!-- EMAIL -->
                        <p class="user-info">
                            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="16" height="16" rx="8" fill="url(#paint0_linear_email)" />
                                <g clip-path="url(#clip0_email)">
                                    <mask id="path-3-outside-1_email" maskUnits="userSpaceOnUse" x="-2612" y="-2227" width="5240" height="3576" fill="black">
                                        <rect fill="white" x="-2612" y="-2227" width="5240" height="3576" />
                                        <path d="M11.6923 5H4.30769C4.22609 5 4.14782 5.03161 4.09012 5.08787C4.03242 5.14413 4 5.22044 4 5.3V10.4C4 10.5591 4.06483 10.7117 4.18024 10.8243C4.29565 10.9368 4.45217 11 4.61538 11H11.3846C11.5478 11 11.7044 10.9368 11.8198 10.8243C11.9352 10.7117 12 10.5591 12 10.4V5.3C12 5.22044 11.9676 5.14413 11.9099 5.08787C11.8522 5.03161 11.7739 5 11.6923 5ZM10.9012 5.6L8 8.19312L5.09885 5.6H10.9012ZM11.3846 10.4H4.61538V5.98213L7.79192 8.82125C7.84869 8.87206 7.92294 8.90025 8 8.90025C8.07706 8.90025 8.15131 8.87206 8.20808 8.82125L11.3846 5.98213V10.4Z" />
                                    </mask>
                                    <path d="M11.6923 5H4.30769C4.22609 5 4.14782 5.03161 4.09012 5.08787C4.03242 5.14413 4 5.22044 4 5.3V10.4C4 10.5591 4.06483 10.7117 4.18024 10.8243C4.29565 10.9368 4.45217 11 4.61538 11H11.3846C11.5478 11 11.7044 10.9368 11.8198 10.8243C11.9352 10.7117 12 10.5591 12 10.4V5.3C12 5.22044 11.9676 5.14413 11.9099 5.08787C11.8522 5.03161 11.7739 5 11.6923 5ZM10.9012 5.6L8 8.19312L5.09885 5.6H10.9012ZM11.3846 10.4H4.61538V5.98213L7.79192 8.82125C7.84869 8.87206 7.92294 8.90025 8 8.90025C8.07706 8.90025 8.15131 8.87206 8.20808 8.82125L11.3846 5.98213V10.4Z" stroke="white" stroke-width="1998" mask="url(#path-3-outside-1_email)" />
                                </g>
                                <defs>
                                    <linearGradient id="paint0_linear_email" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                                        ${iconStopsDetailed}
                                    </linearGradient>
                                    <clipPath id="clip0_email">
                                        <rect x="2" y="2" width="12" height="12" rx="6" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            ${emailDisplay}
                        </p>

                        <!-- WHATSAPP -->
                        <p class="user-info">
                            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="16" height="16" rx="8" fill="url(#paint0_linear_whats)" />
                                <path d="M11.3631 8.95002L9.55776 8.04737C9.48669 8.01196 9.40755 7.99592 9.3283 8.00087C9.24906 8.00583 9.17253 8.03159 9.10643 8.07558L8.27768 8.62845C7.89725 8.41931 7.58417 8.10624 7.37503 7.7258L7.92791 6.89706C7.97189 6.83096 7.99766 6.75442 8.00261 6.67518C8.00757 6.59594 7.99153 6.51679 7.95611 6.44573L7.05346 4.64043C7.01605 4.56487 6.95822 4.50131 6.88653 4.45693C6.81484 4.41256 6.73215 4.38916 6.64783 4.38938C6.04934 4.38938 5.47536 4.62713 5.05216 5.05033C4.62896 5.47353 4.39121 6.04751 4.39121 6.64601C4.3927 7.96224 4.91623 9.22413 5.84695 10.1548C6.77766 11.0856 8.03956 11.6091 9.35579 11.6106C9.65213 11.6106 9.94558 11.5522 10.2194 11.4388C10.4931 11.3254 10.7419 11.1592 10.9515 10.9496C11.161 10.7401 11.3272 10.4913 11.4406 10.2175C11.554 9.94375 11.6124 9.6503 11.6124 9.35396C11.6125 9.27011 11.5892 9.18791 11.5451 9.11656C11.5011 9.04521 11.438 8.98754 11.3631 8.95002ZM9.35579 10.7079C8.27886 10.7067 7.24639 10.2784 6.48489 9.5169C5.72339 8.7554 5.29505 7.72293 5.29386 6.64601C5.29377 6.33297 5.40216 6.02957 5.60057 5.78744C5.79898 5.54531 6.07516 5.37941 6.38212 5.31798L7.02977 6.61554L6.47859 7.43583C6.4374 7.49761 6.41209 7.5686 6.40491 7.64251C6.39772 7.71641 6.40889 7.79095 6.4374 7.85951C6.76032 8.62698 7.37087 9.23752 8.13834 9.56044C8.2071 9.59022 8.2822 9.60242 8.35686 9.59592C8.43152 9.58942 8.50338 9.56443 8.56597 9.52321L9.3902 8.97372L10.6878 9.62137C10.6259 9.92868 10.4592 10.205 10.2163 10.4031C9.97341 10.6013 9.66927 10.709 9.35579 10.7079ZM8.00181 2.13275C6.98885 2.13253 5.99308 2.39457 5.11144 2.89336C4.2298 3.39216 3.49231 4.11071 2.97076 4.97909C2.44921 5.84747 2.16137 6.83608 2.13525 7.84871C2.10913 8.86133 2.34563 9.86347 2.82172 10.7576L2.18141 12.6785C2.12837 12.8376 2.12067 13.0083 2.15918 13.1714C2.19769 13.3346 2.28088 13.4838 2.39943 13.6024C2.51798 13.7209 2.6672 13.8041 2.83037 13.8426C2.99354 13.8811 3.16422 13.8734 3.32326 13.8204L5.24421 13.1801C6.03108 13.5986 6.90295 13.8323 7.79365 13.8636C8.68435 13.8949 9.57047 13.7228 10.3847 13.3604C11.199 12.9981 11.92 12.455 12.4931 11.7724C13.0661 11.0898 13.4761 10.2857 13.692 9.42094C13.9078 8.55623 13.9238 7.6537 13.7388 6.78188C13.5538 5.91005 13.1725 5.09183 12.6241 4.38933C12.0756 3.68683 11.3743 3.11851 10.5734 2.72752C9.77251 2.33652 8.89306 2.13312 8.00181 2.13275ZM8.00181 12.9646C7.12905 12.9652 6.2716 12.7353 5.51614 12.2983C5.46082 12.2662 5.39933 12.2463 5.33572 12.2397C5.27211 12.2332 5.20785 12.2403 5.14718 12.2605L3.03723 12.9646L3.74074 10.8546C3.76101 10.794 3.76818 10.7297 3.76176 10.6661C3.75534 10.6025 3.73549 10.541 3.7035 10.4857C3.15625 9.53952 2.93653 8.43922 3.07843 7.35547C3.22033 6.27171 3.71591 5.26507 4.48829 4.49171C5.26068 3.71835 6.26669 3.2215 7.35026 3.07823C8.43384 2.93497 9.53441 3.1533 10.4812 3.69935C11.4281 4.2454 12.1682 5.08866 12.5869 6.0983C13.0056 7.10793 13.2826 8.29811 13 9.35396C12.7174 10.4098 11.8912 11.2723 11.0242 11.9379C10.1572 12.6035 9.09482 12.9644 8.00181 12.9646Z" fill="white" />
                                <defs>
                                    <linearGradient id="paint0_linear_whats" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                                        ${iconStopsDetailed}
                                    </linearGradient>
                                </defs>
                            </svg>
                            (75) 9 8331-9011
                        </p>

                        <!-- TELEFONE (CORREÇÃO 2: COR SÓLIDA NO FILL) -->
                        <p class="user-info">
                            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="16" height="16" rx="8" fill="url(#paint0_linear_phone)" />
                                <rect x="2" y="2" width="12" height="12" rx="6" fill="white" />

                                <!-- CORREÇÃO IMPORTANTE AQUI: fill do path agora é a cor sólida (iconStart), igual ao React -->
                                <svg x="4.5" y="3.5" width="7" height="9" viewBox="0 0 122.88 122.27">
                                    <path 
                                        d="M33.84,50.25c4.13,7.45,8.89,14.6,15.07,21.12c6.2,6.56,13.91,12.53,23.89,17.63c0.74,0.36,1.44,0.36,2.07,0.11 c0.95-0.36,1.92-1.15,2.87-2.1c0.74-0.74,1.66-1.92,2.62-3.21c3.84-5.05,8.59-11.32,15.3-8.18c0.15,0.07,0.26,0.15,0.41,0.21 l22.38,12.87c0.07,0.04,0.15,0.11,0.21,0.15c2.95,2.03,4.17,5.16,4.2,8.71c0,3.61-1.33,7.67-3.28,11.1 c-2.58,4.53-6.38,7.53-10.76,9.51c-4.17,1.92-8.81,2.95-13.27,3.61c-7,1.03-13.56,0.37-20.27-1.69 c-6.56-2.03-13.17-5.38-20.39-9.84l-0.53-0.34c-3.31-2.07-6.89-4.28-10.4-6.89C31.12,93.32,18.03,79.31,9.5,63.89 C2.35,50.95-1.55,36.98,0.58,23.67c1.18-7.3,4.31-13.94,9.77-18.32c4.76-3.84,11.17-5.94,19.47-5.2c0.95,0.07,1.8,0.62,2.25,1.44 l14.35,24.26c2.1,2.72,2.36,5.42,1.21,8.12c-0.95,2.21-2.87,4.25-5.49,6.15c-0.77,0.66-1.69,1.33-2.66,2.03 c-3.21,2.33-6.86,5.02-5.61,8.18L33.84,50.25L33.84,50.25L33.84,50.25z" 
                                        fill="${iconStart}"
                                    />
                                </svg>
                                <defs>
                                    <linearGradient id="paint0_linear_phone" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                                        ${iconStopsDetailed}
                                    </linearGradient>
                                </defs>
                            </svg>
                            (75) 3199-2999 | RAMAL: ${ramalDisplay}
                        </p>

                        <!-- LOCATION -->
                        <p class="user-info location">
                            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="16" height="16" rx="8" transform="matrix(-1 0 0 1 16 0)" fill="url(#gradLocation)" />
                                <rect x="2" y="2" width="12" height="12" rx="6" fill="white" />
                                <path d="M8 4C7.20463 4.00095 6.44209 4.33237 5.87968 4.92157C5.31726 5.51078 5.0009 6.30963 5 7.14289C5 9.8322 7.72727 11.8633 7.84352 11.9483C7.88938 11.9819 7.94401 12 8 12C8.05599 12 8.11062 11.9819 8.15648 11.9483C8.27273 11.8633 11 9.8322 11 7.14289C10.9991 6.30963 10.6827 5.51078 10.1203 4.92157C9.55791 4.33237 8.79537 4.00095 8 4ZM8 6.00002C8.21576 6.00002 8.42668 6.06705 8.60608 6.19263C8.78548 6.31821 8.9253 6.4967 9.00787 6.70553C9.09044 6.91436 9.11204 7.14416 9.06995 7.36585C9.02785 7.58755 8.92396 7.79119 8.77139 7.95102C8.61882 8.11085 8.42444 8.2197 8.21283 8.2638C8.00121 8.30789 7.78186 8.28526 7.58253 8.19876C7.38319 8.11226 7.21281 7.96578 7.09294 7.77783C6.97307 7.58989 6.90909 7.36893 6.90909 7.14289C6.90909 6.83978 7.02403 6.54909 7.22861 6.33476C7.4332 6.12043 7.71067 6.00002 8 6.00002Z" fill="url(#gradLocation2)" />
                        
                                <defs>
                                    <linearGradient id="gradLocation" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                                        ${iconStops}
                                    </linearGradient>
                                    <linearGradient id="gradLocation2" x1="11.0417" y1="12" x2="3.69004" y2="9.99089" gradientUnits="userSpaceOnUse">
                                        ${iconStops}
                                    </linearGradient>
                                </defs>
                            </svg>
                            Rua Osvaldo Cruz, 324 - Kalilândia - Centro, Feira de Santana - BA, 44001-288
                        </p>
                    </div>

                    <div class="contas-logo">
                        <span class="divider"></span>
                        ${logoImg}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};

exportRouter.post("/signature", upload.single("image"), (req, res) => {
    const body = req.body as any;
    if (req.file && req.file.buffer) {
        body.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
    const payload = body as ExportPayload;
    try {
        const html = buildHtml(payload);
        res.header("Content-Type", "text/html; charset=utf-8").send(html);
    } catch (error) {
        console.error("Erro ao gerar visualização da assinatura:", error);
        res.status(500).json({
            message: "Erro ao gerar visualização da assinatura",
            error: error instanceof Error ? error.message : error,
        });
    }
});
