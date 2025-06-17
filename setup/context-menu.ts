import { defineContextMenuSetup } from "@slidev/types";
import { computed } from "vue";

export default defineContextMenuSetup((items) => {
    return computed(() => [
        ...items.value,
        {
            small: false,
            label: "Copy example text", // or a Vue component
            action() {
                const text =
                    "Künstlische Intelligenz (KI) ist wen Computer oder Maschienen versuhen, so zu denken und zu lernen wie ein Mensch. Sie können sachen wie Probleme lösen, lernen aus Erfahrung oder sogar kreativ sein, ähnlich wie wir. KI kann zum Beispiel Bilder erkennen, Sprache verstehen oder Empfehlungen geben.";
                navigator.clipboard.writeText(text);
            },
        },
    ]);
});
