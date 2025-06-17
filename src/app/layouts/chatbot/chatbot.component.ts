import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../../core/share/shared.module';
import { ChatService } from '../service/chatbot.service';

@Component({
  selector: 'app-chatbot',
  imports: [
    SharedModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {
  isOpen = false;
  inputText = '';
  messages: { text: string; sender: 'user' | 'bot' }[] = [];

  constructor(
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    const prompt = this.inputText.trim();
    if (!prompt) return;

    this.messages.push({ text: prompt, sender: 'user' });
    this.inputText = '';

    this.chatService.sendMessage({ prompt }).subscribe({
      next: res => {
        const answer = (res?.data || 'Không có phản hồi').replace(/\n/g, '<br>');
        this.messages.push({ text: answer, sender: 'bot' });

      },
      error: err => {
        this.messages.push({ text: 'Đã xảy ra lỗi khi gọi Gemini.', sender: 'bot' });
        console.error('Gemini error:', err);
      }
    });

  }
}
