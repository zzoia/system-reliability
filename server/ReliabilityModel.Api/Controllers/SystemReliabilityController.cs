using System;
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

            var systemReques = HybridToSystemRequest(hybridRequest);
            var system = (MultipleModuleSystem) systemReques.ToSystem();

            var systemStateGraph = new SystemStateGraph(system);

            var result = systemStateGraph.Transitions.Select(transition => new AdjacencyModel
            {
                FromState = ToModel(transition.SystemState),
                ToStates = transition.ToSystemStates.Select(ToModel)
            });

            return Ok(result);
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
