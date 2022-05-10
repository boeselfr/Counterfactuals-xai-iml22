import torch
import transformers
import numpy as np


def roberta_inference(sentence1: str, 
                    sentence2: str, 
                    tokenizer: transformers.models.roberta.tokenization_roberta_fast.RobertaTokenizerFast, 
                    model: transformers.models.roberta.modeling_roberta.RobertaForSequenceClassification):
    encoded_input = tokenizer([(sentence1, sentence2)], padding=True, truncation=True, return_tensors='pt')
    with torch.no_grad():
        logits = model(**encoded_input)[0] ## select the string in returned list
    prediction: np.ndarray = torch.argmax(logits, dim=1).detach().cpu().numpy() ## returns prediction array
    return model.config.id2label[prediction[0]]

