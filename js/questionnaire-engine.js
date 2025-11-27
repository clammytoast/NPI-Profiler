class NPIQuestionnaire {
    constructor() {
        this.currentSection = 0;
        this.currentQuestion = 0;
        this.responses = {};
        this.sections = [];
        
        this.loadQuestionnaireData();
    }

    async loadQuestionnaireData() {
        // Your questionnaire structure
        this.sections = [
            {
                id: "developmental_history",
                name: "Life Experiences & Development",
                questions: [
                    {
                        id: "early_childhood_moments",
                        text: "When you think back to your early childhood, what moments stand out the most emotionally?",
                        type: "text",
                        maxLength: 1000
                    },
                    {
                        id: "childhood_safety",
                        text: "Can you describe a time when you felt very safe or very unsafe as a child?",
                        type: "text",
                        maxLength: 1000
                    },
                    // ... Continue with all 47 questions from your questionnaire
                    {
                        id: "understanding_story",
                        text: "If someone wanted to truly understand you, what story would you tell them first?",
                        type: "text",
                        maxLength: 1500
                    }
                ]
            },
            {
                id: "personality_assessment",
                name: "Core Personality",
                questions: [
                    {
                        id: "big_five_openness",
                        text: "How open are you to new experiences? (1- Very traditional to 10- Very adventurous)",
                        type: "scale",
                        min: 1,
                        max: 10
                    },
                    {
                        id: "big_five_conscientiousness", 
                        text: "How organized and disciplined are you? (1- Very spontaneous to 10- Very organized)",
                        type: "scale",
                        min: 1,
                        max: 10
                    },
                    // ... Include all Big Five facets
                ]
            }
        ];
    }

    getCurrentQuestion() {
        return this.sections[this.currentSection].questions[this.currentQuestion];
    }

    getProgress() {
        const totalQuestions = this.sections.reduce((total, section) => 
            total + section.questions.length, 0);
        const answeredQuestions = Object.keys(this.responses).length;
        return (answeredQuestions / totalQuestions) * 100;
    }

    saveResponse(questionId, response) {
        this.responses[questionId] = {
            value: response,
            timestamp: new Date().toISOString(),
            section: this.sections[this.currentSection].id
        };
    }

    nextQuestion() {
        const currentSection = this.sections[this.currentSection];
        
        if (this.currentQuestion < currentSection.questions.length - 1) {
            this.currentQuestion++;
            return true;
        } else if (this.currentSection < this.sections.length - 1) {
            this.currentSection++;
            this.currentQuestion = 0;
            return true;
        }
        return false; // Questionnaire complete
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            return true;
        } else if (this.currentSection > 0) {
            this.currentSection--;
            this.currentQuestion = this.sections[this.currentSection].questions.length - 1;
            return true;
        }
        return false; // At the beginning
    }

    isComplete() {
        const totalQuestions = this.sections.reduce((total, section) => 
            total + section.questions.length, 0);
        return Object.keys(this.responses).length >= totalQuestions;
    }

    getAllResponses() {
        return this.responses;
    }
}
