declare module "jspdf" {
    interface AutoTableResult {
        finalY: number;
        [key: string]: unknown;
    }

    interface AutoTableOptions {
        startY?: number;
        head?: Array<Array<string | { content: string; styles: Record<string, unknown> }>>;
        body?: Array<Array<string | { content: string; styles: Record<string, unknown> }>>;
        styles?: Record<string, unknown>;
        headStyles?: Record<string, unknown>;
        [key: string]: unknown;
    }

    interface jsPDF {
        autoTable: (options: AutoTableOptions) => AutoTableResult;
        previousAutoTable: {
            finalY: number;
        };
    }
}

declare module "jspdf-autotable";
