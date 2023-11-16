import { ChatPrompt } from "./ChatPrompt.js";
import { InstructionPrompt } from "./InstructionPrompt.js";
import { TextGenerationPromptFormat } from "../TextGenerationPromptFormat.js";
import { validateChatPrompt } from "./validateChatPrompt.js";

/**
 * Formats an instruction prompt as a basic text prompt.
 */
export const mapInstructionPromptToTextFormat: () => TextGenerationPromptFormat<
  InstructionPrompt,
  string
> = () => ({
  stopSequences: [],
  format: (instruction) => {
    let text = "";

    if (instruction.system != null) {
      text += `${instruction.system}\n\n`;
    }

    text += instruction.instruction;

    if (instruction.input != null) {
      text += `\n\n${instruction.input}`;
    }

    return text;
  },
});

/**
 * Formats a chat prompt as a basic text prompt.
 *
 * @param user The label of the user in the chat.
 * @param ai The name of the AI in the chat.
 */
export const mapChatPromptToTextFormat: (options?: {
  user?: string;
  assistant?: string;
  system?: string;
}) => TextGenerationPromptFormat<ChatPrompt, string> = ({
  user = "user",
  assistant = "assistant",
  system,
} = {}) => ({
  format: (chatPrompt) => {
    validateChatPrompt(chatPrompt);

    let text =
      chatPrompt.system != null
        ? `${system != null ? `${system}:` : ""}${chatPrompt.system}\n\n`
        : "";

    for (const { role, content } of chatPrompt.messages) {
      switch (role) {
        case "user": {
          text += `${user}:\n${content}\n\n`;
          break;
        }
        case "assistant": {
          text += `${assistant}:\n${content}\n\n`;
          break;
        }
        default: {
          const _exhaustiveCheck: never = role;
          throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
        }
      }
    }

    // Assistant message prefix:
    text += `${assistant}:\n`;

    return text;
  },
  stopSequences: [`\n${user}:`],
});
