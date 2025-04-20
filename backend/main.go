package main

import (
	"log"
	"net/http"
	"os"
	"subway/translator"

	"encoding/json"

	"github.com/joho/godotenv"
)

type TranslateRequest struct {
	Text       string `json:"text"`
	TargetLang string `json:"targetLang"`
}

type TranslateResponse struct {
	Translation string
}

func TranslateSentenceHandler(w http.ResponseWriter, r *http.Request) {
	log.Print("Translate Sentence Handler")
	// TODO: Set CORS in response header
	// w.Header().Set("Access-Control-Allow-Origin", "chrome-extension://<YOUR_ID>")

	var req TranslateRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Call Translator API
	var t translator.Translator
	switch os.Getenv("TRANSLATION_PROVIDER") {
	case "openai":
		t = &translator.OpenAITranslator{APIKey: os.Getenv("OPENAI_API_KEY")}
	case "deepl":
		t = &translator.DeepLTranslator{APIKey: os.Getenv("DEEPL_API_KEY")}
	}

	translated, err := t.Translate(req.Text, req.TargetLang)

	if err != nil {
		log.Panicln("Error: ", err.Error())
		http.Error(w, "Upstream service is failing", http.StatusBadGateway)
		return
	}

	log.Println("translated text: ", translated)
	json.NewEncoder(w).Encode(TranslateResponse{Translation: translated})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading dot env:" + err.Error())
	}

	http.HandleFunc("/translate", TranslateSentenceHandler)

	log.Println("Listening on :8080")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
