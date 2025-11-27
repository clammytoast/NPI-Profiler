class NPIProfilerApp {
    constructor() {
        this.questionnaire = new NPIQuestionnaire();
        this.analyzer = new PersonalityAnalyzer();
        this.brainGenerator = null;
        this.exporter = new NPIExporter();
        this.npiBrain = null;
        
        this.initializeEventListeners();
        this.initializeQuestionnaire();
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
            this.saveCurrentResponse();
            if (this.questionnaire.previousQuestion()) {
                this.renderCurrentQuestion();
            }
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportNPIBrain();
        });

        document.getElementById('avatar-btn').addEventListener('click', () => {
            alert('Avatar Creator coming soon! Your NPI brain is ready for integration.');
        });
    }

    async initializeQuestionnaire() {
        await this.questionnaire.loadQuestionnaireData();
        this.updateSectionInfo();
    }

    renderCurrentQuestion() {
        const question = this.questionnaire.getCurrentQuestion();
        const section = this.questionnaire.getCurrentSection();
        const container = document.getElementById('question-container');
        
        if (!question) {
            container.innerHTML = '<p>Error loading question. Please refresh the page.</p>';
            return;
        }

        // Update progress and section info
        this.updateProgressDisplay();
        this.updateSectionInfo();
        
        // Update section title and description
        document.getElementById('section-title').textContent = section.name;
        document.getElementById('section-description').textContent = section.description || '';

        // Render question based on type
        let questionHTML = '';
        
        if (question.type === 'text') {
            questionHTML = this.renderTextQuestion(question);
        } else if (question.type === 'scale') {
            questionHTML = this.renderScaleQuestion(question);
        }

        container.innerHTML = questionHTML;
        this.attachQuestionEventListeners();
    }

    renderTextQuestion(question) {
        const existingResponse = this.questionnaire.responses[question.id];
        const currentLength = existingResponse ? existingResponse.value.length : 0;
        
        return `
            <div class="question">
                <div class="question-text">${question.text}</div>
                ${question.placeholder ? `<div class="question-hint">${question.placeholder}</div>` : ''}
                <textarea class="text-response" 
                          data-question-id="${question.id}"
                          placeholder="Share your experience here..."
                          maxlength="${question.maxLength}">${existingResponse ? existingResponse.value : ''}</textarea>
                <div class="response-meta">
                    <div class="char-count"><span>${currentLength}</span> / ${question.maxLength} characters</div>
                    <div class="question-progress">Question ${this.questionnaire.getAnsweredCount() + 1} of ${this.questionnaire.getTotalQuestions()}</div>
                </div>
            </div>
        `;
    }

    renderScaleQuestion(question) {
        const existingResponse = this.questionnaire.responses[question.id];
        const defaultValue = existingResponse ? existingResponse.value : Math.floor((question.max - question.min) / 2) + question.min;
        
        return `
            <div class="question">
                <div class="question-text">${question.text}</div>
                <div class="scale-response">
                    <div class="scale-labels">
                        <span class="min-label">${question.minLabel || question.min}</span>
                        <span class="max-label">${question.maxLabel || question.max}</span>
                    </div>
                    <input type="range" 
                           data-question-id="${question.id}"
                           min="${question.min}" 
                           max="${question.max}" 
                           value="${defaultValue}"
                           class="scale-slider">
                    <div class="scale-value">
                        <span class="current-value">${defaultValue}</span>
                        <span class="value-label">/ ${question.max}</span>
                    </div>
                    <div class="scale-ticks">
                        ${Array.from({length: question.max - question.min + 1}, (_, i) => 
                            `<span class="scale-tick">${i + question.min}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    attachQuestionEventListeners() {
        // Character count for text responses
        const textAreas = document.querySelectorAll('.text-response');
        textAreas.forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const charCount = e.target.parentElement.querySelector('.char-count span');
                charCount.textContent = e.target.value.length;
            });

            // Load existing response if any
            const questionId = textarea.dataset.questionId;
            if (this.questionnaire.responses[questionId]) {
                const charCount = textarea.parentElement.querySelector('.char-count span');
                charCount.textContent = textarea.value.length;
            }
        });

        // Scale sliders - update display value
        const sliders = document.querySelectorAll('.scale-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueDisplay = e.target.parentElement.querySelector('.current-value');
                valueDisplay.textContent = e.target.value;
            });

            // Load existing response if any
            const questionId = slider.dataset.questionId;
            if (this.questionnaire.responses[questionId]) {
                slider.value = this.questionnaire.responses[questionId].value;
                const valueDisplay = slider.parentElement.querySelector('.current-value');
                valueDisplay.textContent = slider.value;
            }
        });
    }

    saveCurrentResponse() {
        const question = this.questionnaire.getCurrentQuestion();
        if (!question) return;

        let responseValue = '';

        if (question.type === 'text') {
            const textarea = document.querySelector(`[data-question-id="${question.id}"]`);
            responseValue = textarea ? textarea.value : '';
        } else if (question.type === 'scale') {
            const slider = document.querySelector(`[data-question-id="${question.id}"]`);
            responseValue = slider ? slider.value : '';
        }

        if (responseValue !== '') {
            this.questionnaire.saveResponse(question.id, responseValue);
        }
    }

    updateProgressDisplay() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progress = this.questionnaire.getProgress();
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% Complete`;
    }

    updateSectionInfo() {
        const currentSectionElem = document.getElementById('current-section');
        const totalSectionsElem = document.getElementById('total-sections');
        
        currentSectionElem.textContent = this.questionnaire.currentSection + 1;
        totalSectionsElem.textContent = this.questionnaire.sections.length;
    }

    async startAnalysis() {
        this.showScreen('analysis-screen');
        
        // Add initial analysis step
        this.addAnalysisStep("Processing your responses...");
        await this.delay(1000);
        
        this.addAnalysisStep("Analyzing personality patterns...");
        await this.delay(1200);
        
        this.addAnalysisStep("Identifying key life events...");
        await this.delay(1000);

        // Generate the NPI brain
        this.addAnalysisStep("Building neural network...");
        await this.generateNPIBrain();
        
        this.addAnalysisStep("Finalizing NPI profile...");
        await this.delay(800);
        
        this.showScreen('export-screen');
        this.renderNPISummary();
    }

    addAnalysisStep(message) {
        const progressContainer = document.getElementById('analysis-progress');
        const newStep = document.createElement('div');
        newStep.className = 'analysis-step';
        newStep.innerHTML = `
            <span class="step-icon">✅</span>
            <span class="step-text">${message}</span>
        `;
        progressContainer.appendChild(newStep);
        
        // Update brain stats in real-time
        this.updateBrainStats();
    }

    updateBrainStats() {
        if (!this.npiBrain) return;
        
        const nodes = Object.keys(this.npiBrain.brain_architecture.neural_network.nodes).length;
        const connections = this.npiBrain.brain_architecture.neural_network.connections.length;
        const principles = this.npiBrain.brain_architecture.moral_framework.principles.length;
        
        document.getElementById('node-count').textContent = nodes;
        document.getElementById('connection-count').textContent = connections;
        document.getElementById('principle-count').textContent = principles;
        
        // Simple canvas visualization
        this.drawSimpleBrain(nodes, connections);
    }

    drawSimpleBrain(nodes, connections) {
        const canvas = document.getElementById('brain-canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < Math.min(connections, 20); i++) {
            const x1 = Math.random() * canvas.width;
            const y1 = Math.random() * canvas.height;
            const x2 = Math.random() * canvas.width;
            const y2 = Math.random() * canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Draw nodes
        ctx.fillStyle = '#4a5568';
        
        for (let i = 0; i < Math.min(nodes, 15); i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 5 + (Math.random() * 5);
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    async generateNPIBrain() {
        const responses = this.questionnaire.getAllResponses();
        const personalityProfile = this.analyzer.analyzeResponses(responses);
        
        // Initialize the brain generator
        this.brainGenerator = new NPIBrainGenerator();
        
        // Generate the complete NPI brain
        this.npiBrain = this.brainGenerator.generateBrain(personalityProfile, responses);
        
        return this.npiBrain;
    }

    renderNPISummary() {
        const statsContainer = document.getElementById('npi-stats');
        const visualizationContainer = document.getElementById('brain-visualization');

        if (!this.npiBrain) {
            statsContainer.innerHTML = '<p>Error generating NPI brain. Please try again.</p>';
            return;
        }

        const nodes = Object.keys(this.npiBrain.brain_architecture.neural_network.nodes).length;
        const connections = this.npiBrain.brain_architecture.neural_network.connections.length;
        const principles = this.npiBrain.brain_architecture.moral_framework.principles.length;
        const reasoningStyle = this.npiBrain.brain_architecture.reasoning_system.default_style;

        statsContainer.innerHTML = `
            <div class="stat-item">
                <h3>${this.npiBrain.metadata.name}</h3>
                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-number">${nodes}</div>
                        <div class="stat-label">Neural Nodes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${connections}</div>
                        <div class="stat-label">Connections</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${principles}</div>
                        <div class="stat-label">Moral Principles</div>
                    </div>
                </div>
                <div class="npi-details">
                    <p><strong>Reasoning Style:</strong> ${reasoningStyle.replace(/_/g, ' ')}</p>
                    <p><strong>Base Mood:</strong> ${this.npiBrain.brain_architecture.emotional_system.base_mood.replace(/_/g, ' ')}</p>
                    <p><strong>Created:</strong> ${new Date(this.npiBrain.metadata.created_date).toLocaleDateString()}</p>
                </div>
            </div>
        `;

        visualizationContainer.innerHTML = `
            <div class="brain-visual-preview">
                <h4>Neural Network Preview</h4>
                <div class="network-diagram">
                    <div class="node-cluster">
                        <div class="node-group memories">Memories (${Math.floor(nodes * 0.6)})</div>
                        <div class="node-group principles">Principles (${principles})</div>
                        <div class="node-group emotions">Emotions (${Math.floor(nodes * 0.3)})</div>
                    </div>
                    <div class="connection-lines"></div>
                </div>
            </div>
        `;
    }

    exportNPIBrain() {
        if (!this.npiBrain) {
            alert('No NPI brain to export. Please complete the questionnaire first.');
            return;
        }

        const fileName = `${this.npiBrain.metadata.name.replace(/\s+/g, '_')}_${Date.now()}.npibrain`;
        this.exporter.exportToFile(this.npiBrain, fileName);
        
        // Show success message
        alert(`Your NPI brain has been exported as "${fileName}"\n\nYou can now import this file into the Avatar Creator to bring your NPI to life!`);
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
