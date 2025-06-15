import {type ComponentCardItem, type PanelComponentMeta, PanelType, UseType,} from "@/type";

export const panelRegistry = new Map<string, PanelComponentMeta>();

// 自动扫描所有 meta.ts
const panelMetaModules = import.meta.glob("/src/component/node/**/meta.ts", {
    eager: true,
    import: "PanelMeta", // 明确指定导入具名导出
});
Object.keys(panelMetaModules).forEach((key) => {
    const panelMeta: PanelComponentMeta = panelMetaModules[
        key
        ] as PanelComponentMeta;
    if (!panelMeta) return;
    panelRegistry.set(panelMeta.type, panelMeta);
});

export const triggerComponentCard = new Map<
    PanelType,
    Array<ComponentCardItem>
>();
export const processorComponentCard = new Map<
    PanelType,
    Array<ComponentCardItem>
>();

panelRegistry.forEach((value: PanelComponentMeta, key: string) => {
    if (value.panelType !== undefined && value.useType !== undefined) {
        if (value.useType.includes(UseType.TRIGGER)) {
            if (!triggerComponentCard.has(value.panelType)) {
                triggerComponentCard.set(value.panelType, [
                    {
                        type: key,
                        iconClassName: value.icon ?? "",
                        name: value.displayName,
                    },
                ]);
            }
            triggerComponentCard.get(value.panelType)?.push({
                type: key,
                iconClassName: value.icon ?? "",
                name: value.displayName,
            });
        }

        if (value.useType.includes(UseType.PROCESSOR)) {
            if (!processorComponentCard.has(value.panelType)) {
                processorComponentCard.set(value.panelType, [
                    {
                        type: key,
                        iconClassName: value.icon ?? "",
                        name: value.displayName,
                    },
                ]);
            }
            processorComponentCard.get(value.panelType)?.push({
                type: key,
                iconClassName: value.icon ?? "",
                name: value.displayName,
            });
        }
    }
});
