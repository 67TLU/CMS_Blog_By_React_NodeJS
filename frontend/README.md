PHẦN 10. REALTIME COMMUNICATION & EVENT-DRIVEN INTEGRATION

Chương 36. Realtime Communication Fundamentals

Mục tiêu: hiểu các cách client và server trao đổi dữ liệu, trước khi đi vào từng công nghệ.

36.1. Realtime Applications là gì?
36.2. Request–Response vs. Realtime Communication
36.3. Client–Server Communication Model
36.4. Polling vs. Long Polling vs. Streaming vs. Push
36.5. Persistent Connections và Connection Lifecycle
36.6. Latency, Throughput, Scalability và Resource Usage
36.7. Khi nào nên sử dụng từng cơ chế giao tiếp?
Chương 37. WebSocket

Mục tiêu: hiểu giao thức WebSocket và có thể triển khai mà không phụ thuộc hoàn toàn vào Socket.IO.

37.1. WebSocket Fundamentals
37.2. HTTP Upgrade Handshake
37.3. WebSocket Client API
37.4. Xây dựng WebSocket Server với Node.js
37.5. Events, Messages và Data Serialization
37.6. Connection Lifecycle và Close Codes
37.7. Ping/Pong, Heartbeat và Dead Connections
37.8. Error Handling và Reconnection
37.9. Authentication và Authorization
37.10. Origin Validation, Rate Limiting và Security
37.11. Broadcasting và Quản lý Connected Clients
37.12. Giới hạn của WebSocket thuần
Bài thực hành: xây dựng hệ thống thông báo trạng thái trực tuyến và chat đơn giản bằng WebSocket thuần.

Chương 38. Socket.IO

Mục tiêu: xây dựng ứng dụng realtime có cấu trúc, dễ phát triển và dễ mở rộng hơn.

38.1. Socket.IO Architecture và Fundamentals
38.2. Cài đặt và cấu hình Socket.IO với Express
38.3. Client–Server Events
38.4. Acknowledgements và Event Timeout
38.5. Rooms và Room-based Broadcasting
38.6. Namespaces
38.7. Middleware và Authentication
38.8. Connection State Recovery và Reconnection
38.9. Error Handling và Connection Management
38.10. Private Messaging và Presence
38.11. Socket.IO với Database
38.12. Redis Adapter và Horizontal Scaling
38.13. Delivery Guarantees, Ordering và Idempotency
38.14. WebSocket thuần vs. Socket.IO
Bài thực hành: chat realtime có đăng nhập, phòng chat, tin nhắn riêng và trạng thái online/offline.

Chương 39. Server-Sent Events (SSE)

Mục tiêu: xây dựng cơ chế server chủ động đẩy dữ liệu xuống trình duyệt qua HTTP.

39.1. SSE Fundamentals
39.2. HTTP Response Streaming
39.3. Event Stream Format
39.4. Xây dựng SSE Endpoint với Node.js
39.5. EventSource API
39.6. Named Events, Event ID và Retry
39.7. Reconnection và Last-Event-ID
39.8. Authentication, CORS và Connection Management
39.9. Realtime Notifications
39.10. Progress Updates cho tác vụ dài
39.11. SSE vs. WebSocket vs. Polling
Bài thực hành: dashboard hiển thị tiến trình xử lý công việc và thông báo mới mà không cần liên tục gọi API.

Chương 40. Polling và Long Polling

Mục tiêu: hiểu phương pháp thay thế đơn giản cho realtime, cũng như lý do nó vẫn xuất hiện trong nhiều hệ thống.

40.1. Polling Fundamentals
40.2. Implementing Polling với fetch() và setInterval()
40.3. Long Polling Fundamentals
40.4. Xây dựng Long Polling Server với Node.js
40.5. Request Timeout và Client Reconnection
40.6. Backoff Strategy và Giới hạn tài nguyên
40.7. Polling vs. Long Polling vs. SSE vs. WebSocket
Bài thực hành: xây dựng tính năng theo dõi trạng thái đơn hàng bằng polling và so sánh với SSE.

Lưu ý: Không cần dành quá nhiều thời gian cho chương này. Bạn nên hiểu nguyên lý, tự triển khai một ví dụ và biết khi nào nên chọn giải pháp khác.

Chương 41. Webhooks

Mục tiêu: tiếp nhận sự kiện từ hệ thống bên ngoài một cách an toàn và đáng tin cậy.

41.1. Webhook Fundamentals
41.2. Webhook vs. Polling vs. WebSocket
41.3. Thiết kế Webhook Endpoint với Express
41.4. Request Body và Raw Body Handling
41.5. Signature Verification và HMAC
41.6. Authentication và Replay Protection
41.7. Idempotency và Duplicate Events
41.8. Retry Policy và Exponential Backoff
41.9. Timeout và HTTP Response Codes
41.10. Webhook Delivery Logs và Debugging
41.11. Asynchronous Processing với Queue
41.12. Thiết kế hệ thống gửi Webhook ra bên ngoài
41.13. Testing Webhooks trong môi trường local
Bài thực hành: tích hợp webhook thanh toán giả lập, xác minh chữ ký, xử lý giao dịch thành công và ngăn xử lý một sự kiện nhiều lần.

Đây là chương mình khuyên bạn không nên bỏ qua, bởi webhook rất hữu ích khi tích hợp các dịch vụ thanh toán, hệ thống quản lý mã nguồn và nền tảng bên thứ ba.

Chương 42. Realtime Architecture và Scaling

Mục tiêu: hiểu những vấn đề chỉ xuất hiện khi có nhiều người dùng hoặc nhiều instance server.

42.1. Stateful vs. Stateless Servers
42.2. Connection Lifecycle trong môi trường production
42.3. Reverse Proxy, Load Balancer và Sticky Sessions
42.4. Horizontal Scaling cho WebSocket và Socket.IO
42.5. Redis Pub/Sub
42.6. Cross-instance Broadcasting
42.7. Message Queues và Background Workers
42.8. Delivery Semantics: At-most-once, At-least-once
42.9. Event Ordering và Idempotent Consumers
42.10. Graceful Shutdown và Connection Draining
42.11. Logging, Metrics và Monitoring
42.12. Backpressure và Giới hạn tài nguyên
42.13. Reliability, Recovery và Failure Handling
Bài thực hành: chạy nhiều instance ứng dụng chat và bảo đảm người dùng ở các instance khác nhau vẫn trao đổi được với nhau.

Chương này thường đem lại nhiều giá trị thực tế hơn việc học thêm một giao thức mới nhưng chưa biết triển khai hệ thống.

Chương 43. gRPC và RPC Communication

Mục tiêu: giao tiếp giữa các service trong hệ thống backend.

43.1. RPC Fundamentals
43.2. REST vs. RPC vs. gRPC
43.3. HTTP/2 và gRPC
43.4. Protocol Buffers và .proto
43.5. Định nghĩa Service và Message
43.6. Tạo gRPC Server với Node.js
43.7. Tạo gRPC Client với Node.js
43.8. Unary RPC
43.9. Server Streaming
43.10. Client Streaming
43.11. Bidirectional Streaming
43.12. Deadlines, Timeouts và Cancellation
43.13. Error Codes và Error Handling
43.14. Authentication, TLS và Metadata
43.15. Service-to-Service Communication
43.16. Khi nào chọn REST, khi nào chọn gRPC?
Bài thực hành: xây dựng hai service, chẳng hạn Order Service và Inventory Service, giao tiếp qua gRPC.

gRPC hỗ trợ nhiều mô hình RPC, bao gồm streaming hai chiều; vì vậy bạn nên học nó sau khi đã vững về HTTP và mô hình client–server.

gRPC+1

Chương 44. Message Brokers và Event-Driven Architecture

Mục tiêu: hiểu sự khác biệt giữa giao tiếp trực tiếp và giao tiếp thông qua trung gian.

44.1. Synchronous vs. Asynchronous Communication
44.2. Event-Driven Architecture Fundamentals
44.3. Message Queue vs. Pub/Sub
44.4. Producer, Consumer và Broker
44.5. RabbitMQ Fundamentals
44.6. Exchanges, Queues và Routing Keys
44.7. Acknowledgements, Retry và Dead-Letter Queues
44.8. Kafka Fundamentals
44.9. Topics, Partitions và Consumer Groups
44.10. Event Processing và Idempotent Consumers
44.11. Outbox Pattern ở mức nhập môn
44.12. Khi nào dùng Redis Pub/Sub, RabbitMQ hay Kafka?
Bài thực hành: khi đơn hàng được tạo, phát sinh event để các worker xử lý gửi email, cập nhật kho và tạo thông báo cho người dùng.

Không nhất thiết học sâu RabbitMQ và Kafka cùng lúc. Bạn có thể bắt đầu với RabbitMQ để hiểu queue và cơ chế xử lý công việc; học Kafka khi có nhu cầu về event streaming, dữ liệu lớn hoặc hệ thống phân tán.

Chương 45. MQTT và IoT Communication

Mục tiêu: làm quen với giao tiếp realtime dành cho thiết bị và mạng có tài nguyên hạn chế.

45.1. MQTT Fundamentals
45.2. Broker, Publisher và Subscriber
45.3. Topics và Wildcards
45.4. QoS 0, 1 và 2
45.5. Retained Messages và Last Will
45.6. Persistent Sessions
45.7. Authentication và TLS
45.8. MQTT Client với Node.js
45.9. Kết nối MQTT với Backend API
45.10. MQTT vs. WebSocket vs. Message Queue
Bài thực hành: nhận dữ liệu nhiệt độ từ thiết bị giả lập và cập nhật dashboard.

Mức độ ưu tiên: học sau, trừ khi bạn định theo IoT hoặc hệ thống thiết bị.

Chương 46. WebRTC

Mục tiêu: hiểu cách xây dựng giao tiếp âm thanh, video và dữ liệu ngang hàng.

46.1. WebRTC Fundamentals
46.2. Peer-to-Peer Communication
46.3. Signaling Server và vai trò của Node.js
46.4. SDP Offer/Answer
46.5. ICE Candidates
46.6. STUN và TURN Servers
46.7. NAT Traversal
46.8. RTCPeerConnection
46.9. Media Streams và getUserMedia()
46.10. Data Channels
46.11. One-to-One Audio/Video Call
46.12. Mesh vs. SFU ở mức kiến trúc
46.13. Bảo mật và các giới hạn khi triển khai production
Bài thực hành: ứng dụng gọi video một-một, sử dụng Node.js làm signaling server.

WebRTC là một nhánh khá sâu. Node.js thường đảm nhận signaling, xác thực và điều phối; việc truyền media có thể diễn ra trực tiếp giữa các peer hoặc thông qua hạ tầng media chuyên dụng.

Chương 47. SOAP và Enterprise Integration

Mục tiêu: đủ khả năng đọc hiểu và tích hợp các hệ thống sử dụng SOAP.

47.1. SOAP Fundamentals
47.2. XML và SOAP Envelope
47.3. WSDL và Service Contracts
47.4. SOAP Request/Response
47.5. SOAP over HTTP
47.6. XML Namespaces và Schema
47.7. SOAP Faults và Error Handling
47.8. Authentication và WS-Security ở mức khái niệm
47.9. Tích hợp SOAP Service từ Node.js
47.10. SOAP vs. REST vs. gRPC