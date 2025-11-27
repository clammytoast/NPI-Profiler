class NPIBrainGenerator {
    constructor() {
        this.nodeCounter = 0;
        this.connectionCounter = 0;
    }

    generateBrain(personalityProfile, questionnaireResponses) {
        const npiName = this.generateNPIName(questionnaireResponses);
        
        const brain = {
            npi_spec_version: "1.0",
            metadata: {
                name: npiName,
                creator: "user_generated",
                created_date: new Date().toISOString(),
                npi_type: "nurture_based"
            },
            brain_architecture: {
                neural_network: {
                    nodes: {},
                    connections: []
                },
                reasoning_system: {
                    default_style: "principled_directness",
                    decision_frameworks: [],
                    cognitive_biases: []
                },
                emotional_system: {
                    base_mood: "analytical_calm",
                    triggers: {},
                    recovery_patterns: []
                },
                moral_framework: {
                    principles: [],
                    value_hierarchy: {}
                }
            },
            avatar_compatibility: {
                supported_platforms: ["unreal_metahuman", "unity", "web_avatar"],
                expression_map: {},
                voice_profile: {
                    pace: "moderate",
                    tone: "neutral",
                    emotional_range: "controlled"
                }
            }
        };

        // Build all components
        this.buildNeuralNetwork(brain, personalityProfile, questionnaireResponses);
        this.buildReasoningSystem(brain, personalityProfile);
        this.buildEmotionalSystem(brain, personalityProfile);
        this.buildMoralFramework(brain, personalityProfile);
        this.configureAvatarCompatibility(brain, personalityProfile);

        return brain;
    }

    generateNPIName(responses) {
        // Extract potential names from questionnaire responses
        const nameResponses = Object.values(responses).filter(r => 
            r.value && typeof r.value === 'string' && r.value.length > 10
        );
        
        if (nameResponses.length > 0) {
            const firstMeaningful = nameResponses[0].value.split(' ').slice(0, 2).join(' ');
            return `${firstMeaningful} NPI`;
        }
        
        return "Personal NPI";
    }

    buildNeuralNetwork(brain, personalityProfile, responses) {
        // Create nodes from nurture events
        personalityProfile.nurtureEvents.forEach((event, index) => {
            const nodeId = `nurture_${index}`;
            
            brain.brain_architecture.neural_network.nodes[nodeId] = {
                id: nodeId,
                type: "nurture_event",
                title: this.generateEventTitle(event.description),
                content: event.description,
                emotional_impact: event.emotional_impact,
                age_estimate: event.age_estimate,
                principles_formed: event.principles || [],
                position: this.calculateNodePosition(index, personalityProfile.nurtureEvents.length),
                activation_level: 0.5,
                last_activated: null
            };

            // Connect to related principles
            event.principles.forEach(principle => {
                this.createConnection(brain, nodeId, `principle_${principle}`, "formed_by", 0.8);
            });
        });

        // Create personality trait nodes
        this.createPersonalityNodes(brain, personalityProfile.bigFive);
        
        // Create emotional pattern nodes
        this.createEmotionalNodes(brain, personalityProfile.emotionalProfile);
    }

    createPersonalityNodes(brain, bigFive) {
        Object.entries(bigFive).forEach(([trait, value]) => {
            const nodeId = `personality_${trait}`;
            
            brain.brain_architecture.neural_network.nodes[nodeId] = {
                id: nodeId,
                type: "personality_trait",
                trait: trait,
                value: value,
                description: this.getTraitDescription(trait, value),
                influence: this.calculateTraitInfluence(value),
                position: this.calculatePersonalityPosition(trait)
            };

            // Connect to relevant nurture events
            this.connectTraitToEvents(brain, trait, value);
        });
    }

    createEmotionalNodes(brain, emotionalProfile) {
        Object.entries(emotionalProfile).forEach(([emotion, patterns]) => {
            const nodeId = `emotion_${emotion}`;
            
            brain.brain_architecture.neural_network.nodes[nodeId] = {
                id: nodeId,
                type: "emotional_pattern",
                emotion: emotion,
                triggers: patterns.triggers || [],
                intensity: patterns.intensity || 0.5,
                duration: patterns.duration || "medium",
                recovery: patterns.recovery || "internal",
                position: this.calculateEmotionPosition(emotion)
            };
        });
    }

    createConnection(brain, sourceId, targetId, type, strength) {
        const connectionId = `conn_${this.connectionCounter++}`;
        
        brain.brain_architecture.neural_network.connections.push({
            id: connectionId,
            source: sourceId,
            target: targetId,
            type: type,
            strength: strength,
            bidirectional: type !== "formed_by"
        });
    }

    buildReasoningSystem(brain, personalityProfile) {
        const reasoningStyle = this.determineReasoningStyle(personalityProfile);
        brain.brain_architecture.reasoning_system.default_style = reasoningStyle;
        
        // Add decision frameworks based on personality
        if (personalityProfile.bigFive.conscientiousness > 7) {
            brain.brain_architecture.reasoning_system.decision_frameworks.push("systematic_analysis");
        }
        
        if (personalityProfile.bigFive.openness > 7) {
            brain.brain_architecture.reasoning_system.decision_frameworks.push("creative_synthesis");
        }
        
        if (personalityProfile.bigFive.agreeableness < 4) {
            brain.brain_architecture.reasoning_system.decision_frameworks.push("principled_independence");
        }

        // Identify cognitive biases
        brain.brain_architecture.reasoning_system.cognitive_biases = 
            this.identifyCognitiveBiases(personalityProfile);
    }

    buildEmotionalSystem(brain, personalityProfile) {
        // Set base mood from personality
        brain.brain_architecture.emotional_system.base_mood = 
            this.determineBaseMood(personalityProfile);

        // Map emotional triggers from nurture events
        personalityProfile.nurtureEvents.forEach(event => {
            Object.entries(event.emotional_impact).forEach(([emotion, intensity]) => {
                if (intensity > 0.3) {
                    brain.brain_architecture.emotional_system.triggers[emotion] = {
                        intensity: intensity,
                        activation: intensity * 0.8,
                        recovery_time: this.calculateRecoveryTime(intensity)
                    };
                }
            });
        });

        // Determine recovery patterns
        brain.brain_architecture.emotional_system.recovery_patterns = 
            this.determineRecoveryPatterns(personalityProfile);
    }

    buildMoralFramework(brain, personalityProfile) {
        // Extract principles from nurture events
        const allPrinciples = new Set();
        
        personalityProfile.nurtureEvents.forEach(event => {
            event.principles.forEach(principle => {
                allPrinciples.add(principle);
            });
        });

        brain.brain_architecture.moral_framework.principles = 
            Array.from(allPrinciples).map(principle => ({
                id: `principle_${principle}`,
                name: principle,
                strength: this.calculatePrincipleStrength(principle, personalityProfile),
                exceptions: this.determinePrincipleExceptions(principle)
            }));

        // Build value hierarchy
        brain.brain_architecture.moral_framework.value_hierarchy = 
            this.buildValueHierarchy(personalityProfile);
    }

    configureAvatarCompatibility(brain, personalityProfile) {
        // Map personality to avatar expressions
        brain.avatar_compatibility.expression_map = {
            analytical_thinking: {
                facial_expression: "concentrated",
                body_language: "still_focused",
                blink_rate: "slow_deliberate"
            },
            emotional_response: this.mapEmotionalExpressions(personalityProfile),
            social_interaction: this.mapSocialBehaviors(personalityProfile)
        };

        // Configure voice profile
        brain.avatar_compatibility.voice_profile = {
            pace: this.determineSpeechPace(personalityProfile),
            tone: this.determineSpeechTone(personalityProfile),
            emotional_range: this.determineEmotionalRange(personalityProfile),
            pause_pattern: this.determinePausePattern(personalityProfile)
        };
    }

    // Helper methods for calculations
    calculateNodePosition(index, totalNodes) {
        const angle = (index / totalNodes) * 2 * Math.PI;
        const radius = 100;
        return [
            Math.cos(angle) * radius + 200, // x
            Math.sin(angle) * radius + 200, // y
            0 // z for 3D
        ];
    }

    calculatePersonalityPosition(trait) {
        const positions = {
            openness: [50, 50, 0],
            conscientiousness: [150, 50, 0],
            extraversion: [250, 50, 0],
            agreeableness: [350, 50, 0],
            neuroticism: [450, 50, 0]
        };
        return positions[trait] || [100, 100, 0];
    }

    determineReasoningStyle(personalityProfile) {
        const { openness, conscientiousness, agreeableness } = personalityProfile.bigFive;
        
        if (conscientiousness > 7 && openness > 6) {
            return "systematic_innovation";
        } else if (agreeableness < 4) {
            return "principled_directness";
        } else if (openness > 7) {
            return "creative_exploration";
        } else {
            return "balanced_analysis";
        }
    }

    identifyCognitiveBiases(personalityProfile) {
        const biases = [];
        const { neuroticism, openness, agreeableness } = personalityProfile.bigFive;

        if (neuroticism > 7) {
            biases.push("threat_amplification");
        }
        
        if (openness < 4) {
            biases.push("tradition_preference");
        }
        
        if (agreeableness > 7) {
            biases.push("harmony_over_truth");
        }

        return biases;
    }

    determineBaseMood(personalityProfile) {
        const { neuroticism, extraversion } = personalityProfile.bigFive;
        
        if (neuroticism < 4 && extraversion > 6) {
            return "confident_engaged";
        } else if (neuroticism > 7) {
            return "cautious_analytical";
        } else {
            return "balanced_calm";
        }
    }

    determineRecoveryPatterns(personalityProfile) {
        const patterns = [];
        const { extraversion, neuroticism } = personalityProfile.bigFive;

        if (extraversion > 6) {
            patterns.push("social_processing");
        } else {
            patterns.push("internal_reflection");
        }

        if (neuroticism < 5) {
            patterns.push("rapid_recovery");
        } else {
            patterns.push("gradual_integration");
        }

        return patterns;
    }

    // ... Additional helper methods for the other systems
}
