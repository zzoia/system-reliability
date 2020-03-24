using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ReliabilityModel.Model;
using ReliabilityModel.Model.Formatters;
using ReliabilityModel.Model.Requests;
using ReliabilityModel.Model.Responses;
using ReliabilityModel.Model.System;

namespace ReliabilityModel.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SystemReliabilityController : ControllerBase
    {
        public SystemReliabilityController()
        {
        }

        [HttpPost("test")]
        public IActionResult Test([FromBody] MultipleModuleSystemRequest multipleModuleSystemRequest)
        {
            var m1 = new SingleModuleSystem("I", 1);
            var m2 = new SingleModuleSystem("II");
            var m3 = new SingleModuleSystem("III");
            var m4 = new SingleModuleSystem("IV");
            var m5 = new SingleModuleSystem("V");
            var m6 = new SingleModuleSystem("VI");

            var system = new MultipleModuleSystem(
                new List<Model.System.System>
                {
                    new MultipleModuleSystem(new List<Model.System.System> { m1, m2 }, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<Model.System.System> { m3, m4 }, ReliabilityDependency.And),
                    new MultipleModuleSystem(new List<Model.System.System> { m5, m6 }, ReliabilityDependency.And)
                }, ReliabilityDependency.Or);

            var systemStateGraph = new SystemStateGraph(system);
            Console.WriteLine(new FullGraphFormatter(new AllStatesFilteringStrategy()).ToString(systemStateGraph));

            var result = systemStateGraph.Transitions.Select(transition => new AdjacencyModel
            {
                FromState = ToModel(transition.SystemState),
                ToStates = transition.ToSystemStates.Select(ToModel)
            });

            return Ok(result);
        }

        private static SystemStateModel ToModel(SystemState systemState)
            => new SystemStateModel
            {
                Status = systemState.IsTerminal ? "terminal" : (systemState.IsWorking ? "working" : "waitingRecovery"),
                ModuleStates = systemState.ModuleStates.Select(state => new ModuleStateModel
                {
                    Left = state.Left,
                    IsWorking = state.IsWorking,
                    Name = state.Module.Name
                })
            };
    }
}
