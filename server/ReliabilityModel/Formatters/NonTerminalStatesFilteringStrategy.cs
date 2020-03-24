using ReliabilityModel.Model;

namespace ReliabilityModel.Model.Formatters
{
    public class NonTerminalStatesFilteringStrategy : StateFilteringStrategy
    {
        public override bool IncludeState(SystemState systemState) => !systemState.IsTerminal;
    }
}