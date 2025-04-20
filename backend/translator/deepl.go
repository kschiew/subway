package translator

import (
	"log"

	"github.com/cluttrdev/deepl-go/deepl"
)

type DeepLTranslator struct {
	APIKey string
}

func (o *DeepLTranslator) Translate(text, targetLang string) (string, error) {
	log.Println("Using DeepL Translator")
	deeplTranslator, err := deepl.NewTranslator(o.APIKey)

	if err != nil {
		log.Fatal("DeepL Translator cannot be initialized: ", err.Error())
	}

	translated, err := deeplTranslator.TranslateText([]string{text}, "FR")

	return translated[0].Text, err
}
