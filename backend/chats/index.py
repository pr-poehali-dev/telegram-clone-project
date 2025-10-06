import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manages chats - create private/group chats, get chat list, send messages
    Args: event with httpMethod, headers with X-User-Id, body with chat data
    Returns: HTTP response with chat data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_chat':
                chat_type = body_data.get('type', 'private')
                chat_name = body_data.get('name')
                member_ids = body_data.get('member_ids', [])
                
                cur.execute(
                    "INSERT INTO chats (type, name, created_by) VALUES (%s, %s, %s) RETURNING id",
                    (chat_type, chat_name, user_id)
                )
                chat_id = cur.fetchone()[0]
                
                member_ids.append(int(user_id))
                for member_id in set(member_ids):
                    cur.execute(
                        "INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)",
                        (chat_id, member_id)
                    )
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'chat_id': chat_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'send_message':
                chat_id = body_data.get('chat_id')
                text = body_data.get('text')
                
                cur.execute(
                    "SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s",
                    (chat_id, user_id)
                )
                if not cur.fetchone():
                    return {
                        'statusCode': 403,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Not a member of this chat'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "INSERT INTO messages (chat_id, user_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
                    (chat_id, user_id, text)
                )
                msg = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'id': msg[0],
                        'chat_id': chat_id,
                        'user_id': int(user_id),
                        'text': text,
                        'created_at': msg[1].isoformat()
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            chat_id = query_params.get('chat_id')
            
            if chat_id:
                cur.execute("""
                    SELECT m.id, m.user_id, u.nickname, m.text, m.created_at
                    FROM messages m
                    JOIN users u ON m.user_id = u.id
                    WHERE m.chat_id = %s
                    ORDER BY m.created_at ASC
                    LIMIT 100
                """, (chat_id,))
                
                messages = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps([{
                        'id': m[0],
                        'user_id': m[1],
                        'nickname': m[2],
                        'text': m[3],
                        'created_at': m[4].isoformat()
                    } for m in messages]),
                    'isBase64Encoded': False
                }
            else:
                cur.execute("""
                    SELECT DISTINCT c.id, c.type, c.name, c.updated_at,
                           (SELECT COUNT(*) FROM chat_members WHERE chat_id = c.id) as member_count
                    FROM chats c
                    JOIN chat_members cm ON c.id = cm.chat_id
                    WHERE cm.user_id = %s
                    ORDER BY c.updated_at DESC
                """, (user_id,))
                
                chats = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps([{
                        'id': ch[0],
                        'type': ch[1],
                        'name': ch[2],
                        'updated_at': ch[3].isoformat(),
                        'member_count': ch[4]
                    } for ch in chats]),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
