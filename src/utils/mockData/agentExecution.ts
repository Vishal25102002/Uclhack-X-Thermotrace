import { AgentExecution, AgentNode, AgentResponse } from "@/types/agent"

// Mock agent execution data
export const mockAgentExecution: AgentExecution = {
  id: "exec-001",
  name: "Cooling System Optimization",
  startTime: new Date(Date.now() - 45000),
  endTime: new Date(Date.now() - 2000),
  status: "success",
  totalDuration: 43000,
  totalCost: 0.0234,
  rootNode: {
    id: "node-1",
    name: "Cooling Control Agent",
    type: "agent",
    status: "success",
    duration: 43000,
    timestamp: new Date(Date.now() - 45000),
    input: {
      task: "Optimize cooling system for energy efficiency",
      currentTemp: 24.5,
      targetTemp: 22.0,
      constraints: ["energy_cost < 0.5", "comfort_level > 0.8"]
    },
    output: {
      decision: "Reduce cooling by 15%",
      confidence: 0.92,
      estimatedSavings: "12% energy reduction"
    },
    metadata: {
      model: "gpt-4",
      confidence: 92
    },
    children: [
      {
        id: "node-2",
        name: "Analyze Current State",
        type: "tool",
        status: "success",
        duration: 1200,
        timestamp: new Date(Date.now() - 44000),
        input: {
          sensors: ["temp_sensor_1", "temp_sensor_2", "humidity_sensor"],
          timeRange: "last_30_minutes"
        },
        output: {
          avgTemp: 24.5,
          humidity: 0.58,
          trend: "stable"
        },
        metadata: {
          toolName: "sensor_analyzer"
        }
      },
      {
        id: "node-3",
        name: "LLM Decision Making",
        type: "llm",
        status: "success",
        duration: 3500,
        timestamp: new Date(Date.now() - 42000),
        input: {
          prompt: "Given current temperature 24.5°C and target 22°C, what's the optimal cooling adjustment?",
          context: {
            historical_data: true,
            weather_forecast: true,
            occupancy: "medium"
          }
        },
        output: {
          reasoning: "Based on current conditions and historical patterns, a gradual 15% reduction in cooling will achieve target temperature within 20 minutes while optimizing energy usage.",
          recommendation: "reduce_cooling_15_percent",
          confidence: 0.92
        },
        metadata: {
          model: "gpt-4",
          tokens: 1245,
          cost: 0.0187
        },
        children: [
          {
            id: "node-4",
            name: "Validate Decision",
            type: "decision",
            status: "success",
            duration: 800,
            timestamp: new Date(Date.now() - 38000),
            input: {
              decision: "reduce_cooling_15_percent",
              validationRules: ["safety_check", "efficiency_check", "comfort_check"]
            },
            output: {
              valid: true,
              passedChecks: ["safety_check", "efficiency_check", "comfort_check"],
              warnings: []
            },
            metadata: {
              confidence: 95
            }
          }
        ]
      },
      {
        id: "node-5",
        name: "Execute Action",
        type: "tool",
        status: "success",
        duration: 2100,
        timestamp: new Date(Date.now() - 5000),
        input: {
          action: "adjust_cooling",
          parameters: {
            change_percent: -15,
            ramp_duration: 120
          }
        },
        output: {
          executed: true,
          newSetpoint: 21.5,
          estimatedCompletion: "2 minutes"
        },
        metadata: {
          toolName: "hvac_controller"
        }
      }
    ]
  }
}

// Mock agent responses for the right panel
export const mockAgentResponses: AgentResponse[] = [
  {
    id: "resp-1",
    timestamp: new Date(Date.now() - 45000),
    type: "thought",
    content: "I need to analyze the current cooling system state to understand the temperature differential and energy consumption patterns.",
    metadata: {
      step: 1
    }
  },
  {
    id: "resp-2",
    timestamp: new Date(Date.now() - 44000),
    type: "action",
    content: "Analyzing sensor data from the past 30 minutes...",
    metadata: {
      step: 2,
      tool: "sensor_analyzer"
    }
  },
  {
    id: "resp-3",
    timestamp: new Date(Date.now() - 42800),
    type: "observation",
    content: "Current temperature: 24.5°C (target: 22°C), Humidity: 58%, Trend: Stable. The system has been maintaining a steady state for the past 20 minutes.",
    metadata: {
      step: 3,
      data: {
        temp: 24.5,
        humidity: 0.58
      }
    }
  },
  {
    id: "resp-4",
    timestamp: new Date(Date.now() - 42000),
    type: "thought",
    content: "Based on the sensor data, I should consult the LLM to determine the optimal cooling adjustment strategy that balances energy efficiency with comfort.",
    metadata: {
      step: 4
    }
  },
  {
    id: "resp-5",
    timestamp: new Date(Date.now() - 38500),
    type: "observation",
    content: "LLM Analysis: A gradual 15% reduction in cooling capacity will achieve the target temperature within 20 minutes. This approach minimizes energy waste while maintaining occupant comfort. Confidence: 92%",
    metadata: {
      step: 5,
      confidence: 0.92,
      model: "gpt-4"
    }
  },
  {
    id: "resp-6",
    timestamp: new Date(Date.now() - 38000),
    type: "action",
    content: "Validating the proposed cooling reduction against safety and comfort constraints...",
    metadata: {
      step: 6
    }
  },
  {
    id: "resp-7",
    timestamp: new Date(Date.now() - 37200),
    type: "observation",
    content: "Validation passed: ✓ Safety check, ✓ Efficiency check, ✓ Comfort check. No warnings detected.",
    metadata: {
      step: 7,
      allChecksPassed: true
    }
  },
  {
    id: "resp-8",
    timestamp: new Date(Date.now() - 5000),
    type: "action",
    content: "Executing cooling adjustment: Reducing cooling by 15% with a 2-minute ramp period...",
    metadata: {
      step: 8,
      tool: "hvac_controller"
    }
  },
  {
    id: "resp-9",
    timestamp: new Date(Date.now() - 2900),
    type: "result",
    content: "✅ Successfully adjusted cooling system. New setpoint: 21.5°C. Estimated time to target: 2 minutes. Expected energy savings: 12%",
    metadata: {
      step: 9,
      success: true,
      energySavings: "12%"
    }
  }
]

export function generateMockAgentExecution(complexity: "simple" | "complex" = "simple"): AgentExecution {
  return mockAgentExecution
}
