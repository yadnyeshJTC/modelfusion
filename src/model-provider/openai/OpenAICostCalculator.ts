import { CostCalculator } from "../../cost/CostCalculator.js";
import { SuccessfulModelCall } from "../../model-function/SuccessfulModelCall.js";
import {
  OpenAIImageGenerationSettings,
  calculateOpenAIImageGenerationCostInMillicents,
} from "./OpenAIImageGenerationModel.js";
import {
  OpenAITextEmbeddingResponse,
  calculateOpenAIEmbeddingCostInMillicents,
  isOpenAIEmbeddingModel,
} from "./OpenAITextEmbeddingModel.js";
import {
  OpenAICompletionResponse,
  calculateOpenAICompletionCostInMillicents,
  isOpenAICompletionModel,
} from "./OpenAICompletionModel.js";
import {
  OpenAITranscriptionModelType,
  OpenAITranscriptionVerboseJsonResponse,
  calculateOpenAITranscriptionCostInMillicents,
} from "./OpenAITranscriptionModel.js";
import {
  OpenAIChatResponse,
  calculateOpenAIChatCostInMillicents,
  isOpenAIChatModel,
} from "./chat/OpenAIChatModel.js";

export class OpenAICostCalculator implements CostCalculator {
  readonly provider = "openai";

  async calculateCostInMillicents(
    call: SuccessfulModelCall
  ): Promise<number | null> {
    const type = call.functionType;
    const model = call.model.modelName;

    switch (type) {
      case "image-generation": {
        return calculateOpenAIImageGenerationCostInMillicents({
          settings: call.settings as OpenAIImageGenerationSettings,
        });
      }

      case "embedding": {
        if (model == null) {
          return null;
        }

        if (isOpenAIEmbeddingModel(model)) {
          const responses = Array.isArray(call.result.response)
            ? (call.result.response as OpenAITextEmbeddingResponse[])
            : [call.result.response as OpenAITextEmbeddingResponse];

          return calculateOpenAIEmbeddingCostInMillicents({
            model,
            responses,
          });
        }
        break;
      }

      case "structure-generation":
      case "text-generation": {
        if (model == null) {
          return null;
        }

        if (isOpenAIChatModel(model)) {
          return calculateOpenAIChatCostInMillicents({
            model,
            response: call.result.response as OpenAIChatResponse,
          });
        }

        if (isOpenAICompletionModel(model)) {
          return calculateOpenAICompletionCostInMillicents({
            model,
            response: call.result.response as OpenAICompletionResponse,
          });
        }

        break;
      }

      case "generate-transcription": {
        if (model == null) {
          return null;
        }

        return calculateOpenAITranscriptionCostInMillicents({
          model: model as OpenAITranscriptionModelType,
          response: call.result
            .response as OpenAITranscriptionVerboseJsonResponse,
        });
      }
    }

    return null;
  }
}
