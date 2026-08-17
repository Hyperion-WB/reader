export class TTSService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static isPlaying = false;

  public static getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter((v) => v.lang.startsWith('zh') || v.lang.startsWith('en'));
  }

  public static speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceIndex?: number;
      onEnd?: () => void;
      onBoundary?: (charIndex: number) => void;
    } = {}
  ) {
    if (!this.synth) return;
    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = options.rate || 1.0;
    this.utterance.pitch = options.pitch || 1.0;

    const voices = this.getVoices();
    if (options.voiceIndex !== undefined && voices[options.voiceIndex]) {
      this.utterance.voice = voices[options.voiceIndex];
    }

    this.utterance.onend = () => {
      this.isPlaying = false;
      if (options.onEnd) options.onEnd();
    };

    this.utterance.onboundary = (e) => {
      if (options.onBoundary) options.onBoundary(e.charIndex);
    };

    this.synth.speak(this.utterance);
    this.isPlaying = true;
  }

  public static pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
      this.isPlaying = false;
    }
  }

  public static resume() {
    if (this.synth) {
      this.synth.resume();
      this.isPlaying = true;
    }
  }

  public static stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
    }
  }

  public static getIsPlaying() {
    return this.isPlaying;
  }
}
