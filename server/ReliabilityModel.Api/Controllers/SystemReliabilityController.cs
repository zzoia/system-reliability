using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ReliabilityModel.Model;
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
        public IActionResult Test([FromBody] HybridSystemRequest hybridRequest)
        {
            if (hybridRequest.Type != ModuleType.Multiple)
            {
                return BadRequest();
            }

            SystemStateGraph systemStateGraph = ToSystemStateGraph(hybridRequest);
            var result = systemStateGraph.Transitions.Select(transition => new AdjacencyModel
            {
                FromState = ToModel(transition.SystemState),
                ToStates = transition.ToSystemStates.Select(ToTransition)
            });

            return Ok(result);
        }

        [HttpPost("plot")]
        public IActionResult GetPlot(double from, 
            double to, 
            double step, 
            [FromBody] HybridSystemRequest hybridRequest)
        {
            if (hybridRequest.Type != ModuleType.Multiple)
            {
                return BadRequest();
            }

            SystemStateGraph system = ToSystemStateGraph(hybridRequest);
            var plotData = system.GetProbability(from, to, step);

            return Ok(plotData);
        }

        private static SystemStateGraph ToSystemStateGraph(HybridSystemRequest systemRequest)
        {
            var systemReques = HybridToSystemRequest(systemRequest);
            var system = (MultipleModuleSystem)systemReques.ToSystem();
            return new SystemStateGraph(system);
        }

        private static SystemRequest HybridToSystemRequest(HybridSystemRequest hybridRequest) => hybridRequest.Type switch
        {
            ModuleType.Multiple => new MultipleModuleSystemRequest
            {
                Dependency = hybridRequest.Dependency.Value,
                Members = hybridRequest.Members.Select(HybridToSystemRequest)
            },
            ModuleType.Single => new SingleModuleSystemRequest
            {
                FailureRate = hybridRequest.FailureRate,
                Left = hybridRequest.Left == -1 ? (int?) null : hybridRequest.Left,
                ModuleName = hybridRequest.ModuleName,
                RecoveryRate = hybridRequest.RecoveryRate
            },
            _ => throw new ArgumentOutOfRangeException(),
        };

        private static SystemStateTransitionModel ToTransition(SystemStateTransition transition)
            => new SystemStateTransitionModel
            {
                ToState = ToModel(transition.ToSystemState),
                IsRecovering = transition.IsRecovering,
                WithRate = transition.WithRate
            };

        private static SystemStateModel ToModel(SystemState systemState)
            => new SystemStateModel
            {
                Status = systemState.IsTerminal ? SystemStateStatus.Terminal : (systemState.IsWorking ? SystemStateStatus.Working : SystemStateStatus.WaitingRecovery),
                ModuleStates = systemState.ModuleStates.Select(state => new ModuleStateModel
                {
                    Left = state.Left,
                    IsWorking = state.IsWorking,
                    Name = state.Module.Name
                })
            };
    }
}
