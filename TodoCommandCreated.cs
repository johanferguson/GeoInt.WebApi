using MediatR;
using MediateR.Core.Interfaces.Messages.Base;
using MediateR.Application.Messaging.Features.Base.Commands.PublishMessageCommand;
using MediateR.Domain.Todo.Entities;

namespace MediateR.Application.Messages.Todo.Commands
{
    /// <summary>
    /// Command to publish todo created messages (following MediateR.Application pattern)
    /// </summary>
    public sealed class TodoCommandCreated : IPublishMessageCommand<TodoEntity>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TodoCommandCreated"/> class.
        /// </summary>
        /// <param name="id">Todo identifier</param>
        /// <param name="title">Todo title</param>
        /// <param name="createdAt">When the todo was created</param>
        /// <param name="completedAt">When the todo was completed</param>
        public TodoCommandCreated(Guid id, string title, DateTime createdAt, DateTime completedAt)
        {
            Id = id;
            Title = title;
            CreatedAt = createdAt;
            CompletedAt = completedAt;
        }

        /// <summary>
        /// Todo identifier
        /// </summary>
        public Guid Id { get; }

        /// <summary>
        /// Todo title
        /// </summary>
        public string Title { get; }

        /// <summary>
        /// When the todo was created
        /// </summary>
        public DateTime CreatedAt { get; }

        /// <summary>
        /// When the todo was completed
        /// </summary>
        public DateTime CompletedAt { get; }

        /// <summary>
        /// Topic to publish to
        /// </summary>
        public string Topic => "todo.created";

        /// <summary>
        /// Converts the command to TodoEntity for messaging
        /// </summary>
        /// <returns>TodoEntity</returns>
        public TodoEntity ToEntity()
        {
            return new TodoEntity
            {
                Id = this.Id,
                title = this.Title,
                is_complete = true,
                created_at = this.CreatedAt,
                modified_at = this.CompletedAt
            };
        }
    }
}
