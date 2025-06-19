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
                    "Künstlische Intelligenz (KI) ist wenn Computer oder Maschienen versuhen, so zu denken und zu lernen wie ein Mensch. Sie können sachen wie Probleme lösen, lernen aus Erfahrung oder sogar kreativ sein, ähnlich wie wir. KI kann zum Beispiel Bilder erkennen, Sprache verstehen oder Empfehlungen geben.";
                navigator.clipboard.writeText(text);
            },
        },
        {
            small: false,
            label: "Copy example text 2",
            action() {
                const text =
                    "Am 1.1.24 fand um 9:00 eine Sitzung im Rathaus statt. 5 Leute waren anwesend. Die Sitzung dauerte von 9-18 Uhr. Es wurde beschlossen, Fr. 327,65 für neue Stühle auszugeben. Die Kosten pro Stuhl betragen Fr. 65.50.";
                navigator.clipboard.writeText(text);
            },
        },
    ]);
});
