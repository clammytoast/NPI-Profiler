class NPIQuestionnaire {
    constructor() {
        this.currentSection = 0;
        this.currentQuestion = 0;
        this.responses = {};
        this.sections = [];
        
        this.loadQuestionnaireData();
    }

    async loadQuestionnaireData() {
        try {
            // Load from external JSON file
            const response = await fetch('data/questions.json');
            const data = await response.json();
            this.sections = data.sections;
        } catch (error) {
            console.error('Failed to load questionnaire data:', error);
            // Fallback to embedded questions
            this.loadFallbackQuestions();
        }
    }

    loadFallbackQuestions() {
        // Embedded fallback questions if JSON fails
        this.sections = [
            {
                id: "developmental_history",
                name: "Life Experiences & Development", 
                questions: [
                    {
                        id: "early_childhood_moments",
                        text: "When you think back to your early childhood, what moments stand out the most emotionally?",
                        type: "text",
                        maxLength: 1500
                    },
                    // ... include essential questions as fallback
                ]
            }
        ];
    }

    getCurrentSection() {
        return this.sections[this.currentSection];
    }

    getCurrentQuestion() {
        const section = this.getCurrentSection();
        return section ? section.questions[this.currentQuestion] : null;
    }

    getTotalQuestions() {
        return this.sections.reduce((total, section) => total + section.questions.length, 0);
    }

    getAnsweredCount() {
        return Object.keys(this.responses).length;
    }

    getProgress() {
        return (this.getAnsweredCount() / this.getTotalQuestions()) * 100;
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
