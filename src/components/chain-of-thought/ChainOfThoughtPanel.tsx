"use client"

import React from "react"
import { ScrollArea, Card, CardContent, CardHeader, CardTitle, Accordion, AccordionContent, AccordionItem, AccordionTrigger, Separator } from "@/components/ui"
import { PerceivedState } from "./sections/PerceivedState"
import { ConsideredActions } from "./sections/ConsideredActions"
import { SimulatedOutcomes } from "./sections/SimulatedOutcomes"
import { SelectedAction } from "./sections/SelectedAction"
import { Reasoning } from "./sections/Reasoning"

export interface ChainOfThoughtPanelProps {
  decisionId: string
}

export default function ChainOfThoughtPanel({
  decisionId,
}: ChainOfThoughtPanelProps) {
  // TODO: Fetch decision data using decisionId
  // For now, using placeholder data

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Chain of Thought</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <Accordion type="multiple" defaultValue={["state", "actions", "outcomes", "selected", "reasoning"]} className="w-full">
              <AccordionItem value="state">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span>Perceived State</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <PerceivedState decisionId={decisionId} />
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <AccordionItem value="actions">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>🤔</span>
                    <span>Considered Actions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ConsideredActions decisionId={decisionId} />
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <AccordionItem value="outcomes">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>🧮</span>
                    <span>Simulated Outcomes</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SimulatedOutcomes decisionId={decisionId} />
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <AccordionItem value="selected">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Selected Action</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SelectedAction decisionId={decisionId} />
                </AccordionContent>
              </AccordionItem>

              <Separator className="my-4" />

              <AccordionItem value="reasoning">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>💭</span>
                    <span>Reasoning</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Reasoning decisionId={decisionId} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
