CREATE TABLE task_shares (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL,
    shared_with_id UUID NOT NULL,
    permission VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_task_share_task
        FOREIGN KEY (task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_task_share_user
        FOREIGN KEY (shared_with_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_task_share_task_user
        UNIQUE (task_id, shared_with_id)
);

CREATE INDEX idx_task_shares_task_id
    ON task_shares(task_id);

CREATE INDEX idx_task_shares_shared_with_id
    ON task_shares(shared_with_id);