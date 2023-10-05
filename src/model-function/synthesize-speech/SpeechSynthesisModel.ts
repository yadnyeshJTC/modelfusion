import { FunctionOptions } from "../../core/FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";

export interface SpeechSynthesisModelSettings extends ModelSettings {}

export interface SpeechSynthesisModel<
  SETTINGS extends SpeechSynthesisModelSettings = SpeechSynthesisModelSettings,
> extends Model<SETTINGS> {
  /**
   * Generates an mp3 audio buffer that contains the speech for the given text.
   */
  generateSpeechResponse: (
    text: string,
    options?: FunctionOptions
  ) => PromiseLike<Buffer>;
}
