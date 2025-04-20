package translator

import (
	"context"
	"log"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type OpenAITranslator struct {
	APIKey string
}

func (o *OpenAITranslator) Translate(text, targetLang string) (string, error) {
	log.Println("Using OpenAI Translator")

	client := openai.NewClient(option.WithAPIKey(o.APIKey))

	chatCompletion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage("You are a translation service provider that translates subtitles into another language. For each User message, translate them into French and return nothing but the translated output."),
			openai.UserMessage(text),
		},
		Model: openai.ChatModelChatgpt4oLatest,
	})

	if err != nil {
		return "", err
	}

	translated := chatCompletion.Choices[0].Message.Content
	return translated, nil
}
