/**
 * LLM Prompt Analyzer
 * 
 * This script analyzes input prompts to determine the most suitable LLM models
 * based on cost efficiency and token usage, and provides optimization recommendations.
 */

// LLM Model Database with key characteristics
const llmModels = [
    {
      name: "GPT-4",
      provider: "OpenAI",
      strengths: ["complex reasoning", "creative writing", "code generation", "multilingual", "long context"],
      tokenCost: { input: 0.00003, output: 0.00006 },
      maxTokens: 128000,
      latency: "high",
      multimodal: true,
      bestFor: ["complex tasks", "nuanced understanding", "professional content creation", "research"]
    },
    {
      name: "GPT-3.5 Turbo",
      provider: "OpenAI", 
      strengths: ["general knowledge", "simple coding", "conversation", "speed"],
      tokenCost: { input: 0.0000015, output: 0.000002 },
      maxTokens: 16000,
      latency: "low",
      multimodal: false,
      bestFor: ["simple chat", "basic assistance", "high-volume low-complexity tasks"]
    },
    {
      name: "Claude 3 Opus",
      provider: "Anthropic",
      strengths: ["nuanced understanding", "reasoning", "writing", "safety", "long context"],
      tokenCost: { input: 0.000015, output: 0.000075 },
      maxTokens: 200000,
      latency: "high",
      multimodal: true,
      bestFor: ["complex reasoning", "creative content", "nuanced responses", "professional content"]
    },
    {
      name: "Claude 3 Sonnet",
      provider: "Anthropic",
      strengths: ["balanced performance", "reasoning", "writing", "safety"],
      tokenCost: { input: 0.000003, output: 0.000015 },
      maxTokens: 200000,
      latency: "medium",
      multimodal: true,
      bestFor: ["balanced use cases", "content creation", "business applications"]
    },
    {
      name: "Claude 3 Haiku",
      provider: "Anthropic",
      strengths: ["speed", "efficiency", "basic tasks", "cost effectiveness"],
      tokenCost: { input: 0.00000025, output: 0.00000125 },
      maxTokens: 200000,
      latency: "low",
      multimodal: true,
      bestFor: ["quick responses", "simple tasks", "cost-sensitive applications"]
    },
    {
      name: "Llama 3 70B",
      provider: "Meta",
      strengths: ["open source", "customization", "self-hosting", "reasoning"],
      tokenCost: { input: 0.0000015, output: 0.0000015 }, // when using hosted solutions
      maxTokens: 8000,
      latency: "medium",
      multimodal: false,
      bestFor: ["local deployment", "privacy-focused applications", "customized use cases"]
    },
    {
      name: "Mistral Large",
      provider: "Mistral AI",
      strengths: ["reasoning", "code", "general knowledge", "efficiency"],
      tokenCost: { input: 0.000007, output: 0.000021 },
      maxTokens: 32000,
      latency: "medium",
      multimodal: false,
      bestFor: ["technical content", "code generation", "data analysis", "enterprise applications"]
    },
    {
      name: "Gemini 1.5 Pro",
      provider: "Google",
      strengths: ["multimodal", "long context", "reasoning", "knowledge"],
      tokenCost: { input: 0.000001, output: 0.000002 },
      maxTokens: 1000000,
      latency: "medium",
      multimodal: true,
      bestFor: ["content analysis", "document processing", "multimodal tasks", "extended context needs"]
    }
  ];
  
  // Task type classification keywords
  const taskKeywords = {
    "code generation": ["code", "program", "function", "script", "algorithm", "programming", "develop", "software", "app", "application"],
    "creative writing": ["story", "poem", "creative", "fiction", "novel", "write", "narrative", "script", "screenplay", "article"],
    "content summarization": ["summary", "summarize", "condense", "brief", "outline", "abstract", "overview"],
    "data analysis": ["analyze", "analysis", "data", "statistics", "trends", "insights", "numbers", "metrics", "dataset", "visualization"],
    "translation": ["translate", "translation", "language", "convert"],
    "simple query": ["help", "what is", "how to", "guide", "explain", "when", "who", "where"],
    "complex reasoning": ["reason", "complex", "nuanced", "philosophical", "ethical", "analyze", "evaluate", "think through", "logic", "implications"],
    "multimodal": ["image", "picture", "photo", "diagram", "chart", "visual", "figure", "graph", "video"],
    "long context": ["document", "book", "report", "long", "extensive", "comprehensive", "complete", "entire", "chapter"]
  };
  
  /**
   * Estimates token count for a given string
   * Note: This is a rough approximation - actual tokenization varies by model
   * @param {string} text - Input text to estimate tokens for
   * @return {number} - Estimated token count
   */
  function estimateTokenCount(text) {
    // Simple estimation: ~4 characters per token on average
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Analyzes a prompt to determine the most suitable LLM models
   * @param {string} prompt - The input prompt to analyze
   * @return {Object} - Analysis results and recommendations
   */
  function analyzePrompt(prompt) {
    const promptLower = prompt.toLowerCase();
    const estimatedTokens = estimateTokenCount(prompt);
    
    // Detect task type based on keywords
    const taskScores = {};
    for (const [taskType, keywords] of Object.entries(taskKeywords)) {
      taskScores[taskType] = keywords.filter(keyword => promptLower.includes(keyword)).length;
    }
    
    // Sort task types by relevance score
    const detectedTasks = Object.entries(taskScores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([task]) => task);
      
    // Filter models that can handle the token count
    const eligibleModels = llmModels.filter(model => model.maxTokens >= estimatedTokens);
    
    // Score models based on task suitability and cost efficiency
    const scoredModels = eligibleModels.map(model => {
      // Base score for task suitability
      let score = 0;
      
      // Check strengths against detected tasks
      detectedTasks.forEach((task, index) => {
        // Give more weight to primary tasks
        const taskWeight = 1 / (index + 1);
        
        // Check if model strengths align with the task
        const strengthMatch = model.strengths.some(strength => 
          task.includes(strength) || strength.includes(task)
        );
        
        if (strengthMatch) score += 20 * taskWeight;
        
        // Check best-for categories
        const bestForMatch = model.bestFor.some(category => 
          task.includes(category) || category.includes(task)
        );
        
        if (bestForMatch) score += 15 * taskWeight;
      });
      
      // Adjust for multimodal needs
      if (taskScores["multimodal"] > 0 && !model.multimodal) {
        score -= 30; // Heavy penalty for non-multimodal models if task requires it
      }
      
      // Adjust for long context needs
      if (taskScores["long context"] > 0 && model.maxTokens < 32000) {
        score -= 20; // Penalty for models with limited context if task requires long context
      }
      
      // Calculate approximate cost
      const estimatedOutputTokens = estimatedTokens * 1.5; // Assuming output is 1.5x input
      const estimatedCost = (model.tokenCost.input * estimatedTokens) + 
                             (model.tokenCost.output * estimatedOutputTokens);
      
      // Cost efficiency score (inverse relationship - lower cost is better)
      const costEfficiencyScore = 100 / (estimatedCost * 1000000);
      
      // Add cost efficiency to total score, with appropriate weighting
      score += costEfficiencyScore;
      
      // Latency adjustment
      if (model.latency === "low") score += 10;
      if (model.latency === "high") score -= 5;
      
      return {
        model: model.name,
        provider: model.provider,
        score,
        estimatedCost,
        strength: model.strengths,
        suitableFor: model.bestFor,
        tokenLimit: model.maxTokens,
        detectedTaskMatch: detectedTasks.filter(task => 
          model.strengths.some(strength => task.includes(strength) || strength.includes(task))
        )
      };
    });
    
    // Sort models by score
    const rankedModels = scoredModels.sort((a, b) => b.score - a.score);
    const top2Models = rankedModels.slice(0, 2);
    
    // Generate prompt optimization recommendations
    const bestModel = top2Models[0];
    let optimizationTips = [];
    
    // General optimization tips
    optimizationTips.push("Be concise and specific, removing unnecessary context or explanations");
    optimizationTips.push("Use clear formatting with sections and bullet points for complex requests");
    
    // Model-specific optimization tips
    if (bestModel) {
      if (bestModel.model.includes("GPT-3.5")) {
        optimizationTips.push("Break complex tasks into smaller, simpler instructions");
        optimizationTips.push("Provide examples for formatting you want in the output");
      } else if (bestModel.model.includes("Claude")) {
        optimizationTips.push("Use XML tags to structure different parts of your request");
        optimizationTips.push("Clearly specify the format you want for the response");
      } else if (bestModel.model.includes("Llama")) {
        optimizationTips.push("Keep instructions straightforward and literal");
        optimizationTips.push("Avoid complex multi-part requests");
      }
    }
    
    // Task-specific optimization tips
    if (detectedTasks.includes("code generation")) {
      optimizationTips.push("Specify programming language, desired functionality, and expected inputs/outputs");
      optimizationTips.push("Ask for code comments to explain the implementation");
    } else if (detectedTasks.includes("creative writing")) {
      optimizationTips.push("Provide specific parameters: tone, style, length, and key elements to include");
      optimizationTips.push("Reference specific genres or authors as style examples");
    } else if (detectedTasks.includes("data analysis")) {
      optimizationTips.push("Structure your data format clearly");
      optimizationTips.push("Specify exactly what insights or calculations you're looking for");
    }
    
    // Create an optimized prompt example
    let optimizedPromptExample = "";
    
    if (detectedTasks.length > 0) {
      const primaryTask = detectedTasks[0];
      
      if (primaryTask === "code generation") {
        optimizedPromptExample = `Create a ${bestModel.model.includes("GPT") ? "JavaScript" : "Python"} function that [specific functionality]. Input: [format/example]. Output should: [expected result]. Include comments explaining the key parts.`;
      } else if (primaryTask === "creative writing") {
        optimizedPromptExample = `Write a [length] [content type] about [specific topic] with a [tone] tone. Include these elements: [key points]. Format it with [specific structure].`;
      } else if (primaryTask === "content summarization") {
        optimizedPromptExample = `Summarize the following text in [number] bullet points, focusing on [key aspects]: [text to summarize]`;
      } else {
        optimizedPromptExample = `I need information about [specific topic]. Please provide [exactly what you want] formatted as [desired format].`;
      }
    }
    
    return {
      inputPrompt: prompt,
      estimatedTokenCount: estimatedTokens,
      detectedTasks,
      recommendations: {
        topModels: top2Models,
        optimizationTips,
        optimizedPromptExample
      }
    };
  }
  
  /**
   * Example usage with a sample prompt
   */
  function demonstrateAnalyzer() {
    const samplePrompt = "Write a detailed analysis of climate change impacts on agriculture in the next 50 years, including potential mitigation strategies and economic implications. Please format it as a comprehensive report with citations.";
    
    console.log("SAMPLE PROMPT ANALYSIS");
    console.log("======================");
    
    const analysis = analyzePrompt(samplePrompt);
    
    console.log("Input Prompt:", analysis.inputPrompt);
    console.log("Estimated Token Count:", analysis.estimatedTokenCount);
    console.log("Detected Task Types:", analysis.detectedTasks.join(", "));
    console.log("\nRECOMMENDED MODELS");
    console.log("------------------");
    
    analysis.recommendations.topModels.forEach((model, index) => {
      console.log(`#${index + 1}: ${model.model} (${model.provider})`);
      console.log(`   Strengths: ${model.strength.join(", ")}`);
      console.log(`   Task Match: ${model.detectedTaskMatch.join(", ")}`);
      console.log(`   Estimated Cost: $${model.estimatedCost.toFixed(6)}`);
      console.log(`   Token Limit: ${model.tokenLimit.toLocaleString()}`);
      console.log("");
    });
    
    console.log("OPTIMIZATION TIPS");
    console.log("-----------------");
    analysis.recommendations.optimizationTips.forEach((tip, index) => {
      console.log(`${index + 1}. ${tip}`);
    });
    
    console.log("\nOPTIMIZED PROMPT EXAMPLE");
    console.log("------------------------");
    console.log(analysis.recommendations.optimizedPromptExample);
    
    return analysis;
  }
  
  // Run the demonstration
  demonstrateAnalyzer();
  
  // Export for use in other scripts
  module.exports = {
    analyzePrompt,
    estimateTokenCount
  };