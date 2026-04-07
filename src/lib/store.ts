import { FormData, ChatMessage, AnalysisResult, AppPhase } from "./types";

type Listener = () => void;

class AppStore {
  private listeners: Set<Listener> = new Set();
  
  // State
  phase: AppPhase = "landing";
  formData: FormData = {};
  messages: ChatMessage[] = [];
  analysis: AnalysisResult | null = null;
  currentStep: number = 0;
  currentPage: number = 0;
  isLoading: boolean = false;
  domain: string = "";
  subject: string = "";
  
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notify() {
    this.listeners.forEach((l) => l());
  }
  
  setPhase(phase: AppPhase) {
    this.phase = phase;
    this.notify();
  }
  
  setFormValue(key: string, value: string | number | boolean | string[]) {
    this.formData = { ...this.formData, [key]: value };
    this.notify();
  }
  
  setFormData(data: FormData) {
    this.formData = { ...this.formData, ...data };
    this.notify();
  }
  
  addMessage(message: ChatMessage) {
    this.messages = [...this.messages, message];
    this.notify();
  }
  
  setAnalysis(analysis: AnalysisResult) {
    this.analysis = analysis;
    this.notify();
  }
  
  setCurrentStep(step: number) {
    this.currentStep = step;
    this.notify();
  }
  
  setCurrentPage(page: number) {
    this.currentPage = page;
    this.notify();
  }
  
  setLoading(loading: boolean) {
    this.isLoading = loading;
    this.notify();
  }
  
  setDomain(domain: string) {
    this.domain = domain;
    this.notify();
  }
  
  setSubject(subject: string) {
    this.subject = subject;
    this.notify();
  }
  
  reset() {
    this.phase = "landing";
    this.formData = {};
    this.messages = [];
    this.analysis = null;
    this.currentStep = 0;
    this.currentPage = 0;
    this.isLoading = false;
    this.domain = "";
    this.subject = "";
    this.notify();
  }
  
  getSnapshot() {
    return {
      phase: this.phase,
      formData: this.formData,
      messages: this.messages,
      analysis: this.analysis,
      currentStep: this.currentStep,
      currentPage: this.currentPage,
      isLoading: this.isLoading,
      domain: this.domain,
      subject: this.subject,
    };
  }
}

export const store = new AppStore();
