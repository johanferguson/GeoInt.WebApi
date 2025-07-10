using GeoInt.Application.Features.Base.Query.GetAll;
using GeoInt.Domain.Todo.Entities;
using MediatR;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoInt.Application.Todo.Features.Queries
{
    public class GetAllTodosQuery : IGetAllQuery<TodoEntity, TodoEntity>
    {
        // Optional filters/paging later
    }
}