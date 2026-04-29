{
  "nodes": [
    {
      "parameters": {
        "pollTimes": {
          "item": [
            {
              "mode": "everyMinute"
            }
          ]
        },
        "simple": false,
        "filters": {},
        "options": {}
      },
      "type": "n8n-nodes-base.gmailTrigger",
      "typeVersion": 1.3,
      "position": [
        752,
        1360
      ],
      "id": "23a12efd-70c2-4e50-b04a-fbd55d3b7d81",
      "name": "Gmail Trigger3",
      "credentials": {
        "gmailOAuth2": {
          "id": "IzBlXwxFxoj8esPm",
          "name": "Gmail OAuth2 API"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "a1",
              "name": "text",
              "value": "={{ $json.text }}",
              "type": "string"
            },
            {
              "id": "a2",
              "name": "subject",
              "value": "={{ $json.subject }}",
              "type": "string"
            },
            {
              "id": "a3",
              "name": "senderEmail",
              "value": "={{ $json.from.value[0].address }}",
              "type": "string"
            },
            {
              "id": "a4",
              "name": "senderName",
              "value": "={{ $json.from.value[0].name }}",
              "type": "string"
            },
            {
              "id": "a5",
              "name": "emailId",
              "value": "={{ $json.id }}",
              "type": "string"
            },
            {
              "id": "c5c74a61-e871-4e39-b9b1-2f7cb7ded345",
              "name": "email_date",
              "value": "={{ $json.date }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        976,
        1360
      ],
      "id": "83235282-48cb-4cd5-9ee9-7360378e2b27",
      "name": "Extract T1 (실시간)1"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "subscriptions",
        "matchType": "allFilters",
        "filters": {
          "conditions": [
            {
              "keyName": "sender_email",
              "condition": "eq",
              "keyValue": "={{ $json.senderEmail }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        1200,
        1360
      ],
      "id": "4056fe28-cf39-46f2-a99e-c8ddc904e6f8",
      "name": "DB 검문소1",
      "alwaysOutputData": false,
      "credentials": {
        "supabaseApi": {
          "id": "Wf2fNl14yKuEV4M3",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 3
          },
          "conditions": [
            {
              "id": "c1",
              "leftValue": "={{ $json.id }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.3,
      "position": [
        1424,
        1360
      ],
      "id": "5319c814-8d9b-43c3-904a-e58dcd19936c",
      "name": "If (구독자 확인)1"
    },
    {
      "parameters": {
        "jsCode": "return $('Extract T1 (실시간)1').item.json;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1648,
        1360
      ],
      "id": "1a353dac-8ae6-4002-b3be-d57b5ebce410",
      "name": "Track 1 Restore1"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "sync-newsletter",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [
        752,
        1648
      ],
      "id": "76f9af21-c69b-4fa5-9734-f9619c84ecd6",
      "name": "Webhook (대시보드 동기화 버튼)1",
      "webhookId": "feedcurator-sync",
      "alwaysOutputData": false
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "subscriptions"
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        976,
        1648
      ],
      "id": "440ce2fa-a301-4b2c-a679-801f16cc975e",
      "name": "구독 명단 싹 가져오기1",
      "credentials": {
        "supabaseApi": {
          "id": "Wf2fNl14yKuEV4M3",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\nif (items.length === 0) {\n  return [{ json: { query: \"from:nobody@nowhere.com\" } }];\n}\nlet queryParts =[];\nfor (let item of items) {\n  if (item.json.sender_email) {\n    queryParts.push(`from:${item.json.sender_email}`);\n  }\n}\nlet finalQuery = `(${queryParts.join(\" OR \")}) is:unread`;\nreturn[{ json: { query: finalQuery } }];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1200,
        1648
      ],
      "id": "72fc99b5-b622-44e7-9f4b-6c59d931cd9d",
      "name": "검색어 동적 조립2"
    },
    {
      "parameters": {
        "operation": "getAll",
        "limit": 10,
        "simple": false,
        "filters": {
          "q": "={{ $json.query }}"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.2,
      "position": [
        1424,
        1648
      ],
      "id": "92567e7d-11af-408c-8354-a7fbd7274828",
      "name": "Gmail 안읽음 핀셋수집1",
      "webhookId": "c4c59ed4-0c6b-44eb-8cf3-70f1d2983397",
      "credentials": {
        "gmailOAuth2": {
          "id": "IzBlXwxFxoj8esPm",
          "name": "Gmail OAuth2 API"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "b1",
              "name": "text",
              "value": "={{ $json.text }}",
              "type": "string"
            },
            {
              "id": "b2",
              "name": "subject",
              "value": "={{ $json.subject }}",
              "type": "string"
            },
            {
              "id": "b3",
              "name": "senderEmail",
              "value": "={{ $json.from.value[0].address }}",
              "type": "string"
            },
            {
              "id": "b4",
              "name": "senderName",
              "value": "={{ $json.from.value[0].name }}",
              "type": "string"
            },
            {
              "id": "b5",
              "name": "emailId",
              "value": "={{ $json.id }}",
              "type": "string"
            },
            {
              "id": "578ca040-c84e-43b9-a9eb-b60a4a0f7006",
              "name": "email_date",
              "value": "={{ $json.date }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1632,
        1648
      ],
      "id": "021499b8-817f-4612-8941-8013aca47af8",
      "name": "Extract T2 (동기화)1"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=아래 입력된 뉴스레터 원문을 바탕으로 마케팅/콘텐츠 기획자를 위한 요약 데이터를 작성해. \n반드시 아래의 JSON 형식으로만 답변하고, 마크다운(```json)이나 다른 설명은 절대 포함하지 마.\n{\n  \"source_id\": \"{{ $json.emailId }}\",\n  \"title\": \"원문 제목 (광고 태그 제거)\",\n  \"summary\": \"핵심 3줄 요약 텍스트 (줄바꿈 기호 \\\\n 사용)\",\n  \"insight\": \"마케팅 기획자가 실무에 적용할 수 있는 1문장 인사이트\",\n  \"tags\": \"#트렌드 #마케팅 처럼 어울리는 해시태그 2개\"\n}\n\n[데이터 원문]\n제목: {{ $json.subject }}\n내용: {{ $json.text }}",
        "messages": {
          "messageValues": []
        },
        "batching": {}
      },
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "typeVersion": 1.9,
      "position": [
        1920,
        1488
      ],
      "id": "551f12d0-e657-4b40-8379-4941f518a8ba",
      "name": "Basic LLM Chain5"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatCohere",
      "typeVersion": 1,
      "position": [
        1904,
        1680
      ],
      "id": "6b63891b-8787-42d2-a57e-105cd419cfde",
      "name": "Cohere Chat Model5",
      "credentials": {
        "cohereApi": {
          "id": "pqm9VxRBcgNbvQhI",
          "name": "Cohere account"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all(); \nconst results = [];         \n\nlet emailItems;\ntry { emailItems = $('Extract T2 (동기화)1').all(); } catch(e) {}\nif (!emailItems || emailItems.length === 0) { emailItems = $('Track 1 Restore1').all(); }\n\nfor (let i = 0; i < items.length; i++) {\n    let rawText = items[i].json.text; \n    if (!rawText) continue;\n\n    // 마크다운 제거 및 파싱\n    rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();\n    let aiData = JSON.parse(rawText);\n\n    //  ID로 진짜 짝꿍 메일을 '검색'합니다.\n    let matchedEmail = emailItems.find(email => email.json.emailId === aiData.source_id);\n    \n    // 만약 짝꿍 메일을 못 찾았다면 꼬인 데이터이므로 건너뜁니다 (에러 방지)\n    if (!matchedEmail) continue;\n\n    let emailData = matchedEmail.json;\n\n    // 완성된 데이터를 바구니에 담기\n    results.push({\n        json: {\n            source_id: emailData.emailId, \n            title: aiData.title,\n            summary: aiData.summary,\n            insight: aiData.insight,\n            tags: aiData.tags,\n            original_url: `https://mail.google.com/mail/u/0/#all/${emailData.emailId}`, \n            source_type: \"newsletter\",\n            source_name: `${emailData.senderName} (${emailData.senderEmail})`,\n          email_date: emailData.email_date\n        }\n    });\n}\n\nreturn results;"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2192,
        1488
      ],
      "id": "3a43a02f-86bc-4701-9ea2-bf30e45fa4ed",
      "name": "Code in JavaScript5"
    },
    {
      "parameters": {
        "tableId": "articles",
        "dataToSend": "autoMapInputData"
      },
      "id": "d672c188-2822-4bfb-8789-3983b65929d1",
      "name": "Upsert to Supabase5",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        2416,
        1488
      ],
      "credentials": {
        "supabaseApi": {
          "id": "Wf2fNl14yKuEV4M3",
          "name": "Supabase account"
        }
      },
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "operation": "markAsRead",
        "messageId": "={{ $json.source_id }}"
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.2,
      "position": [
        2416,
        1648
      ],
      "id": "f09292ec-2101-448b-8dae-f6279cd14d67",
      "name": "Gmail (읽음",
      "webhookId": "7c7e6ab3-056e-40fd-bf30-3d814275258a",
      "credentials": {
        "gmailOAuth2": {
          "id": "IzBlXwxFxoj8esPm",
          "name": "Gmail OAuth2 API"
        }
      }
    }
  ],
  "connections": {
    "Gmail Trigger3": {
      "main": [
        [
          {
            "node": "Extract T1 (실시간)1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract T1 (실시간)1": {
      "main": [
        [
          {
            "node": "DB 검문소1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "DB 검문소1": {
      "main": [
        [
          {
            "node": "If (구독자 확인)1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If (구독자 확인)1": {
      "main": [
        [
          {
            "node": "Track 1 Restore1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Track 1 Restore1": {
      "main": [
        [
          {
            "node": "Basic LLM Chain5",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook (대시보드 동기화 버튼)1": {
      "main": [
        [
          {
            "node": "구독 명단 싹 가져오기1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "구독 명단 싹 가져오기1": {
      "main": [
        [
          {
            "node": "검색어 동적 조립2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "검색어 동적 조립2": {
      "main": [
        [
          {
            "node": "Gmail 안읽음 핀셋수집1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Gmail 안읽음 핀셋수집1": {
      "main": [
        [
          {
            "node": "Extract T2 (동기화)1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract T2 (동기화)1": {
      "main": [
        [
          {
            "node": "Basic LLM Chain5",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Basic LLM Chain5": {
      "main": [
        [
          {
            "node": "Code in JavaScript5",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Cohere Chat Model5": {
      "ai_languageModel": [
        [
          {
            "node": "Basic LLM Chain5",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript5": {
      "main": [
        [
          {
            "node": "Upsert to Supabase5",
            "type": "main",
            "index": 0
          },
          {
            "node": "Gmail (읽음",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Upsert to Supabase5": {
      "main": [
        []
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "92d202556f6b08aa0bcf881de96473bf3ad2a76228371118d4732ad00371c0dd"
  }
}