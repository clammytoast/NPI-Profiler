class NPIProfilerApp {
    constructor() {
        this.questionnaire = new NPIQuestionnaire();
        this.analyzer = new PersonalityAnalyzer();
        this.brainGenerator = new NPIBrainGenerator();
        this.exporter = new NPIExporter();
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('questionnaire-screen');
            this.renderCurrentQuestion();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.saveCurrentResponse();
            if (this.questionnaire.nextQuestion()) {
                this.renderCurrentQuestion();
            } else {
                this.startAnalysis();
            }
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            if (this.questionnaire.previousQuestion()) {
                this.renderCurrentQuestion();
            }
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportNPIBrain();
        });
    }

    renderCurrentQuestion() {
        const question = this.questionnaire.getCurrentQuestion();
        const container = document.getElementById('question-container');
        const progressFill = document.getElementById('progress-fill');
        const sectionTitle = document.getElementById('section-title');

        // Update progress
        progressFill.style.width = `${this.questionnaire.getProgress()}%`;

        // Update section title
        sectionTitle.textContent = this.questionnaire.sections[this.questionnaire.currentSection].name;

        // Render question based on type
        let questionHTML = '';
        
        if (question.type === 'text') {
            questionHTML = `
                <div class="question">
                    <div class="question-text">${question.text}</div>
                    <textarea class="text-response" 
                              data-question-id="${question.id}"
                              placeholder="Share your experience here..."
                              maxlength="${question.maxLength}"></textarea>
                    <div class="char-count"><span>0</span> / ${question.maxLength} characters</div>
                </div>
            `;
        } else if (question.type === 'scale') {
            questionHTML = `
                <div class="question">
                    <div class="question-text">${question.text}</div>
                    <div class="scale-response">
                        <input type="range" 
                               data-question-id="${question.id}"
                               min="${question.min}" 
                               max="${question.max}" 
                               value="${Math.floor((question.max - question.min) / 2)}"
                               class="scale-slider">
                        <div class="scale-labels">
                            <span>${question.min}</span>
                            <span>${Math.floor((question.max - question.min) / 2)}</span>
                            <span>${question.max}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = questionHTML;
        this.attachQuestionEventListeners();
    }

    attachQuestionEventListeners() {
        // Character count for text responses
        const textAreas = document.querySelectorAll('.text-response');
        textAreas.forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const charCount = e.target.nextElementSibling.querySelector('span');
                charCount.textContent = e.target.value.length;
            });

            // Load existing response if any
            const questionId = textarea.dataset.questionId;
            if (this.questionnaire.responses[questionId]) {
                textarea.value = this.questionnaire.responses[questionId].value;
                textarea.dispatchEvent(new Event('input'));
            }
        });

        // Scale sliders
        const sliders = document.querySelectorAll('.scale-slider');
        sliders.forEach(slider => {
            // Load existing response if any
            const questionId = slider.dataset.questionId;
            if (this.questionnaire.responses[questionId]) {
                slider.value = this.questionnaire.responses[questionId].value;
            }
        });
    }

    saveCurrentResponse() {
        const question = this.questionnaire.getCurrentQuestion();
        let responseValue = '';

        if (question.type === 'text') {
            const textarea = document.querySelector(`[data-question-id="${question.id}"]`);
            responseValue = textarea ? textarea.value : '';
        } else if (question.type === 'scale') {
            const slider = document.querySelector(`[data-question-id="${question.id}"]`);
            responseValue = slider ? slider.value : '';
        }

        if (responseValue) {
            this.questionnaire.saveResponse(question.id, responseValue);
        }
    }

    async startAnalysis() {
        this.showScreen('analysis-screen');
        
        // Simulate analysis steps
        const steps = document.querySelectorAll('.analysis-step');
        for (let i = 0; i < steps.length; i++) {
            steps[i].style.opacity = '1';
            steps[i].style.fontWeight = 'bold';
            await this.delay(1000); // Simulate processing time
        }

        // Generate the NPI brain
        await this.generateNPIBrain();
        this.showScreen('export-screen');
        this.renderNPISummary();
    }

    async generateNPIBrain() {
    const responses = this.questionnaire.getAllResponses();
    const personalityProfile = this.analyzer.analyzeResponses(responses);
    
    // Initialize the brain generator
    this.brainGenerator = new NPIBrainGenerator();
    
    // Generate the complete NPI brain
    this.npiBrain = this.brainGenerator.generateBrain(personalityProfile, responses);
    
    // Update UI to show brain generation progress
    this.updateAnalysisProgress("Brain architecture complete");
}
    
    updateAnalysisProgress(message) {
    const progressContainer = document.getElementById('analysis-progress');
    const newStep = document.createElement('div');
    newStep.className = 'analysis-step';
    newStep.innerHTML = `
        <span class="step-icon">✅</span>
        <span class="step-text">${message}</span>
    `;
    progressContainer.appendChild(newStep);
}

    renderNPISummary() {
        const statsContainer = document.getElementById('npi-stats');
        const visualizationContainer = document.getElementById('brain-visualization');

        statsContainer.innerHTML = `
            <div class="stat-item">
                <h3>NPI Profile Summary</h3>
                <p><strong>Nurture Events:</strong> ${this.npiBrain.brain_architecture.neural_network.nodes.length}</p>
                <p><strong>Moral Principles:</strong> ${this.npiBrain.brain_architecture.moral_framework.principles.length}</p>
                <p><strong>Reasoning Style:</strong> ${this.npiBrain.brain_architecture.reasoning_system.default_style}</p>
                <p><strong>Emotional Range:</strong> ${Object.keys(this.npiBrain.brain_architecture.emotional_system.triggers).length} triggers</p>
            </div>
        `;

        // Simple visualization
        visualizationContainer.innerHTML = `
            <div class="brain-visual">
                <div class="neural-node" style="top: 20%; left: 30%;">Memories</div>
                <div class="neural-node" style="top: 40%; left: 50%;">Principles</div>
                <div class="neural-node" style="top: 60%; left: 70%;">Emotions</div>
                <div class="neural-connection" style="top: 25%; left: 35%; width: 100px; transform: rotate(45deg);"></div>
                <div class="neural-connection" style="top: 45%; left: 55%; width: 100px; transform: rotate(-45deg);"></div>
            </div>
        `;
    }

    exportNPIBrain() {
        const fileName = `my_npi_brain_${Date.now()}.npibrain`;
        this.exporter.exportToFile(this.npiBrain, fileName);
        
        // Show success message
        alert(`Your NPI brain has been exported as ${fileName}\nYou can now import this file into the Avatar Creator.`);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NPIProfilerApp();
});
