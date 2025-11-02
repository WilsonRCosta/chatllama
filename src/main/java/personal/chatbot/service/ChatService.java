package personal.chatbot.service;

import lombok.extern.jbosslog.JBossLog;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Service
@JBossLog
public class ChatService {

    @Value("${chatbot.system.message}")
    String systemMessage;

    private final OllamaChatModel ollamaChatModel;

    public ChatService(OllamaChatModel ollamaChatModel) {
        this.ollamaChatModel = ollamaChatModel;
    }

    public Flux<String> ask(String input, String model) {
        List<Message> conversation = new ArrayList<>();
        conversation.add(new SystemMessage(systemMessage));
        conversation.add(new UserMessage(input));

        Prompt prompt = new Prompt(conversation, OllamaOptions.builder()
                .model(model)
                .temperature(0.2)
                .build());

        log.infov("Building response with model {0} for the prompt ''{1}''", model, input);

        return ollamaChatModel.stream(prompt)
                .map(resp -> resp.getResult().getOutput().getText());
    }
}
